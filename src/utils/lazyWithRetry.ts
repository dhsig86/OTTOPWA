import { lazy, ComponentType } from 'react';

/**
 * Utilitário de importação dinâmica resiliente.
 * Captura falhas de carregamento de chunk (erros de rede ou 404 de hashes antigos pós-deploy do Vite)
 * e tenta recarregar o módulo. Se falhar repetidamente, executa o reload da página inteira
 * para atualizar o cache do navegador com o manifesto de assets atual da Vercel.
 */
export function lazyWithRetry(componentImport: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(async () => {
    // Flag no sessionStorage para evitar loops infinitos de recarregamento se houver um erro de código real
    const pageHasRefreshed = sessionStorage.getItem('otto_chunk_retry_refreshed') === '1';

    try {
      const component = await componentImport();
      // Se deu certo, limpa a flag de segurança de reload
      sessionStorage.removeItem('otto_chunk_retry_refreshed');
      return component;
    } catch (error) {
      console.warn("Falha ao carregar o módulo dinâmico do PWA. Tentando recuperar...", error);
      
      try {
        // Tenta buscar o módulo uma segunda vez após um curto delay (pode ser oscilação temporária de rede)
        await new Promise(resolve => setTimeout(resolve, 800));
        const component = await componentImport();
        sessionStorage.removeItem('otto_chunk_retry_refreshed');
        return component;
      } catch (retryError) {
        if (!pageHasRefreshed) {
          console.error("Falha persistente no carregamento do chunk. Forçando recarregamento da página para atualizar assets...", retryError);
          sessionStorage.setItem('otto_chunk_retry_refreshed', '1');
          window.location.reload();
          return new Promise<{ default: ComponentType<any> }>(() => {}); // Retorna promise pendente para evitar crash
        }
        
        // Se a página já foi recarregada na sessão e falhou de novo, repassa o erro para o ErrorBoundary tratar
        console.error("Erro de módulo estático pós-recarregamento. Repassando para o ErrorBoundary.", retryError);
        throw retryError;
      }
    }
  });
}

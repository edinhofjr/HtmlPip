# htmlpip

Componente React genérico para renderizar conteúdo HTML no `documentPictureInPicture`.

## Instalação (projeto local)

Copie a pasta ou publique como pacote e instale no projeto consumidor.

## Uso

```tsx
import { HtmlPip } from "htmlpip";

export function Example() {
  return (
    <HtmlPip
      wrapperClassName="relative h-full w-full"
      contentClassName="h-full w-full"
      windowSize={{ width: 420, height: 760 }}
      renderTrigger={({ isSupported, isOpen, isOpening, toggle }) => (
        <button onClick={toggle} disabled={!isSupported || isOpening}>
          {!isSupported
            ? "PiP indisponivel"
            : isOpen
              ? "Fechar PiP"
              : isOpening
                ? "Abrindo..."
                : "Abrir PiP"}
        </button>
      )}
    >
      <YourComponent />
    </HtmlPip>
  );
}
```

## API

- `children`: conteúdo renderizado no app e movido para PiP quando aberto.
- `renderTrigger`: função para renderizar seu próprio botão/controle.
- `windowSize`: tamanho inicial da janela PiP.
- `rootId`: `id` do container criado dentro da janela PiP.
- `copyStyles`: clona `<style>` e `<link rel="stylesheet">` para a janela PiP.
- `wrapperClassName`: classe do container externo.
- `contentClassName`: classe do wrapper do conteúdo.

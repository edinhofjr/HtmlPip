# htmlpip

Componente React para renderizar conteúdo HTML na API nativa [Document Picture-in-Picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture) do navegador.

Usa `createPortal` para mover os filhos do React para uma janela flutuante independente, mantendo o componente no mesmo React tree — sem libs externas, sem iframes.

## Suporte de navegador

| Navegador | Suporte |
|-----------|---------|
| Chrome 116+ | Sim |
| Edge 116+ | Sim |
| Firefox | Não |
| Safari | Não |

O componente expõe `isSupported` para que você possa desabilitar ou ocultar o trigger em navegadores sem suporte.

## Requisitos

- React >= 18
- react-dom >= 18

## Instalação

Por enquanto o pacote é local. Copie a pasta `src/` para o seu projeto ou publique como pacote npm e instale normalmente:

```bash
npm install htmlpip
```

## Uso básico

```tsx
import { HtmlPip } from "htmlpip";

export function Example() {
  return (
    <HtmlPip
      renderTrigger={({ isSupported, isOpen, isOpening, toggle }) => (
        <button onClick={toggle} disabled={!isSupported || isOpening}>
          {!isSupported
            ? "PiP não suportado"
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

## Controle programático

Você pode controlar a janela PiP via ref ou estado próprio usando as funções `open`, `close` e `toggle`:

```tsx
import { HtmlPip, type HtmlPipControls } from "htmlpip";
import { useRef } from "react";

export function Example() {
  const controlsRef = useRef<HtmlPipControls | null>(null);

  return (
    <>
      <button onClick={() => controlsRef.current?.open()}>Abrir</button>
      <button onClick={() => controlsRef.current?.close()}>Fechar</button>

      <HtmlPip
        renderTrigger={(controls) => {
          controlsRef.current = controls;
          return null; // sem trigger visual
        }}
      >
        <YourComponent />
      </HtmlPip>
    </>
  );
}
```

## Tamanho e estilos customizados

```tsx
<HtmlPip
  windowSize={{ width: 420, height: 760 }}
  copyStyles={true}
  wrapperClassName="relative h-full w-full"
  contentClassName="h-full w-full overflow-auto"
  rootId="pip-container"
>
  <YourComponent />
</HtmlPip>
```

## API

### `HtmlPipProps`

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | — | Conteúdo renderizado no app e movido para a janela PiP quando aberta. |
| `renderTrigger` | `(controls: HtmlPipControls) => ReactNode` | — | Função para renderizar o botão/controle de abertura. Recebe o objeto `HtmlPipControls`. |
| `windowSize` | `{ width?: number; height?: number }` | `{ width: 410, height: 720 }` | Dimensões iniciais da janela PiP em pixels. |
| `copyStyles` | `boolean` | `true` | Clona as tags `<style>` e `<link rel="stylesheet">` do documento principal para a janela PiP. |
| `rootId` | `string` | `"html-pip-root"` | `id` do elemento `<div>` criado como container dentro da janela PiP. |
| `wrapperClassName` | `string` | — | Classe CSS aplicada ao `<div>` wrapper externo do componente. |
| `contentClassName` | `string` | — | Classe CSS aplicada a um `<div>` que envolve os `children`. Omitido se não fornecido. |

### `HtmlPipControls`

Objeto passado para `renderTrigger` e disponível para controle programático.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `isOpen` | `boolean` | `true` enquanto a janela PiP estiver aberta. |
| `isOpening` | `boolean` | `true` durante a abertura assíncrona da janela. |
| `isSupported` | `boolean` | `true` se o navegador suporta a API `documentPictureInPicture`. |
| `open` | `() => Promise<void>` | Abre a janela PiP. Sem efeito se já aberta ou em abertura. |
| `close` | `() => void` | Fecha a janela PiP. |
| `toggle` | `() => void` | Alterna entre abrir e fechar. |

## Como funciona

1. Ao chamar `open()`, o componente requisita uma janela PiP via `documentPictureInPicture.requestWindow()`.
2. Os estilos do documento principal são opcionalmente clonados para a nova janela.
3. Um container `<div>` é criado dentro da janela PiP.
4. O React usa `createPortal` para renderizar os `children` dentro desse container, mantendo-os no React tree original.
5. Quando a janela é fechada (pelo usuário ou via `close()`), o evento `pagehide` dispara e o componente volta a renderizar o conteúdo no documento principal.
6. Ao desmontar o componente, qualquer janela PiP aberta é fechada automaticamente.

## Build

```bash
npm run build   # compila para dist/
npm run check   # checa tipos sem emitir arquivos
```
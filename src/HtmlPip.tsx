import { type ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PipApi = {
  requestWindow: (options?: { height?: number; width?: number }) => Promise<Window>;
};

type BrowserWithPip = Window & {
  documentPictureInPicture?: PipApi;
};

type PipMount = {
  container: HTMLDivElement;
  win: Window;
};

const DEFAULT_BASE_STYLES = `
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: #000;
  }
`;

export type HtmlPipControls = {
  isOpen: boolean;
  isOpening: boolean;
  isSupported: boolean;
  close: () => void;
  open: () => Promise<void>;
  toggle: () => void;
};

export type HtmlPipProps = {
  children: ReactNode;
  contentClassName?: string;
  copyStyles?: boolean;
  renderTrigger?: (controls: HtmlPipControls) => ReactNode;
  rootId?: string;
  windowSize?: {
    height?: number;
    width?: number;
  };
  wrapperClassName?: string;
};

const cloneHeadAssetsToPip = (pipDoc: Document, copyStyles: boolean) => {
  pipDoc.head.innerHTML = "";
  if (copyStyles) {
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      pipDoc.head.appendChild(node.cloneNode(true));
    });
  }

  const baseStyle = pipDoc.createElement("style");
  baseStyle.textContent = DEFAULT_BASE_STYLES;
  pipDoc.head.appendChild(baseStyle);
};

export const HtmlPip = ({
  children,
  contentClassName,
  copyStyles = true,
  renderTrigger,
  rootId = "html-pip-root",
  windowSize = { height: 720, width: 410 },
  wrapperClassName,
}: HtmlPipProps) => {
  const [mount, setMount] = useState<PipMount | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const isSupported = typeof window !== "undefined" &&
    Boolean((window as BrowserWithPip).documentPictureInPicture);
  const isOpen = Boolean(mount);

  const close = useCallback(() => {
    if (!mount) return;
    if (!mount.win.closed) {
      mount.win.close();
    }
    setMount(null);
  }, [mount]);

  const open = useCallback(async () => {
    if (!isSupported || mount || isOpening) return;

    const pipApi = (window as BrowserWithPip).documentPictureInPicture;
    if (!pipApi) return;

    setIsOpening(true);
    try {
      const pipWindow = await pipApi.requestWindow(windowSize);
      const pipDoc = pipWindow.document;

      cloneHeadAssetsToPip(pipDoc, copyStyles);
      pipDoc.body.innerHTML = "";
      pipDoc.body.style.margin = "0";
      pipDoc.body.style.background = "#000";

      const container = pipDoc.createElement("div");
      container.id = rootId;
      container.style.width = "100%";
      container.style.height = "100%";
      pipDoc.body.appendChild(container);

      const handleClose = () => {
        setMount((current) => {
          if (!current || current.win !== pipWindow) return current;
          return null;
        });
      };

      pipWindow.addEventListener("pagehide", handleClose, { once: true });
      setMount({ container, win: pipWindow });
    } finally {
      setIsOpening(false);
    }
  }, [copyStyles, isOpening, isSupported, mount, rootId, windowSize]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }
    void open();
  }, [close, isOpen, open]);

  useEffect(() => {
    return () => {
      if (mount && !mount.win.closed) {
        mount.win.close();
      }
    };
  }, [mount]);

  const content = contentClassName
    ? (
      <div className={contentClassName}>
        {children}
      </div>
    )
    : children;

  return (
    <div className={wrapperClassName}>
      {renderTrigger
        ? renderTrigger({
          close,
          isOpen,
          isOpening,
          isSupported,
          open,
          toggle,
        })
        : null}
      {mount ? createPortal(content, mount.container) : content}
    </div>
  );
};

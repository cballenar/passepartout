import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>passe-partout - Picture frame and matt visualizer.</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div className="site-header">
          <h1 class="text-4xl font-bold"><span style={{cursor:"help"}} title="A thin, flat piece of paper-based material included within a picture frame, which serves as decoration and to separate and thus protect the art from the glass.">passe-partout</span></h1>
        </div>
        <Component />
        <div className="site-footer">
          <p>by <a href="https://crunchyweb.com">CrunchyWeb</a>.</p>
        </div>
      </body>
    </html>
  );
}

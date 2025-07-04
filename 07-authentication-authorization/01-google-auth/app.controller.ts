import { Controller, Get, Request } from "@nestjs/common";
import { Public } from "./auth/public.decorator";

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get()
  main(@Request() request) {
    return `
      <html>
        <head>
          <title>Profile</title>
        </head>
        <body>
          <div id="content">Loading...</div>
          <script>
            (async () => {
              const token = localStorage.getItem('token');

              if (!token) {
                document.getElementById("content").innerHTML = \`
                  <button onclick="window.location.href='/auth/google'">
                    Login via Google
                  </button>
                \`;
                return;
              }

              try {
                const response = await fetch('/auth/profile', {
                  method: 'GET',
                  headers: {
                    'Authorization': 'Bearer ' + token
                  }
                });

                if (!response.ok) {
                  throw new Error('Unauthorized');
                }

                const data = await response.json();

                document.getElementById("content").innerHTML = \`
                  Welcome, \${data.displayName}!<br>
                  <img src="\${data.avatar}" alt="avatar" />
                \`;
              } catch (err) {
                document.getElementById("content").innerHTML = \`
                  <button onclick="window.location.href='/auth/google'">
                    Login via Google
                  </button>
                \`;
              }
            })();
          </script>
        </body>
      </html>
    `;
  }
}

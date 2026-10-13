# IGPage

> Il tuo profilo Instagram, senza Instagram.

La parte più bella di Instagram è il profilo — è un diario visivo da scorrere per rivivere i ricordi. Tutto il resto (il feed, i reel, lo scroll infinito) è solo rumore. IGPage tiene solo la parte che vale: una pagina profilo personale, protetta da password, sempre accessibile e condivisibile con chiunque — anche con chi non ha Instagram.

**Demo live:** [umbertomaraglino.github.io/pagina_ig](https://umbertomaraglino.github.io/pagina_ig)

---

## Screenshot

<p align="center">
  <img src="foto/Screenshot%202026-10-13%20091634.png" width="280" alt="Schermata di login" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22.jpeg" width="180" alt="Pagina profilo" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22%20(1).jpeg" width="180" alt="Post con musica" />
  &nbsp;&nbsp;
  <img src="foto/WhatsApp%20Image%202026-10-13%20at%2011.04.22%20(2).jpeg" width="180" alt="Visualizzatore storie" />
</p>

---

## Cosa fa

- **Protetto da password** — solo tu (e chi ha il link) può vederlo
- **Profilo e bio** — avatar, username, biografia personalizzata
- **Post** — griglia foto con caroselli multi-immagine, didascalie, like e commenti
- **Storie in evidenza** — raccolte di storie con visualizzatore a schermo intero
- **Musica** — allega un'anteprima Deezer di 30 secondi a qualsiasi post o storia; parte in automatico all'apertura
- **Modifica completa** — aggiungi/rimuovi foto, cambia didascalia, cambia musica, elimina post e storie
- **Editor immagini** — ritaglia, zooma e ruota le foto prima di caricarle nelle storie
- **Modalità scura** — segue le preferenze di sistema, attivabile manualmente
- **Mobile-first** — pensato per sembrare un'app nativa su iPhone

---

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Stile | Tailwind CSS 3 (dark mode) |
| Database e Storage | Supabase (PostgreSQL + bucket di storage) |
| API Musica | Deezer, proxiata tramite Supabase Edge Function (Deno) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (deploy automatico ad ogni push su `main`) |

La Supabase Edge Function è il pezzo chiave per la ricerca musicale: il browser chiama il dominio Supabase (nessun problema di CORS), e la funzione recupera i dati da Deezer lato server.

---

## Perché l'ho costruito

Il profilo Instagram è l'unica funzione che vale la pena tenere — è una macchina per i ricordi. Ma usare Instagram solo per guardare il proprio profilo significa fare i conti con un algoritmo progettato per tenerti incollato allo schermo. IGPage è una versione self-hosted e senza distrazioni di quella sola pagina: tua, privata, sempre accessibile, senza bisogno di nessuna app.

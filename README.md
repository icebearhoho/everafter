# EverAfter wedding cards

48 interactive wedding invitation cards, each with its own opening gesture, ongoing motion and personal add-ons. Everything is static HTML/CSS/JS.

- `index.html` is a gallery: pick a card to watch it in a phone frame, or open it full screen.
- `editor/invitation.html?style=<id>` renders one card. It loads `editor/core/` (shared renderer, motion kit and the card registry in `styles.js`), then `editor/styles/<id>/style.css` and `style.js`.
- `editor/data/wedding.json` is the sample couple shown in every card.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

A server is needed (the cards fetch `wedding.json`), so opening `index.html` from disk won't work.

## Groups

| Group | Cards |
|---|---|
| Đặc sắc | 8 signature cards |
| Cổ điển | 10 classic cards |
| Điện ảnh | 10 cinematic cards |
| Phong cách | 10 suite cards |
| Bộ sưu tập mở rộng | 10 standalone cards |

import { app } from './app.js'

const port = Number(process.env.PORT ?? 8787)

app.listen(port, () => {
  console.log(`AIGC detector API is running at http://localhost:${port}`)
})

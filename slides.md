---
title: "Go channels in JS"
theme: "white"
separator: ----
verticalSeparator: ---
enableMenu: false
enableChalkboard: false
enableTitleFooter: false
enableZoom: false
enableSearch: false
css: styles.css
---

![Go channels in JS](title.jpg)

Notes:
olaaa

---

![Nico Gopher](z-gopher-g.png) <!-- .element: style="margin: 0; width: 250px;" -->

## Nicolas Lepage

Développeur chez Zenika Nantes

[![Twitter logo](twitter.png) <!-- .element: style="margin: 0; vertical-align: middle; width: 60px;" --> @njblepage](https://twitter.com/njblepage)

[![Github logo](github.png) <!-- .element: style="margin: 0 15px 0 0; vertical-align: middle; width: 35px;" --> github.com/nlepage](https://github.com/nlepage)

---

## Asynchronisme

Notes:
- Concurrence en Go et channels
- Asynchronisme en JS, promesses, async/await, event-loop
- Comprendre différences

---

## Des channels Go en JS

Notes:
Différentes manières d'implémenter
Implémenter fonctionnalités de base et avancées

---

## Exemple d'utilisation

---

## Disclaimer

Notes:
blabla

----

## Concurrence en Go

---

```go [|3,6|8-10|4|]
package main

func main() {
    go func1()
    // ...
}

func func1() {
    // ...
}
```

---

```go []
package main

import "time"

var solde = 100

func main() {
    go deposer(100)
    go deposer(200)

    time.Sleep(100)

    println(solde)
}

func deposer(montant int) {
    solde = solde + montant
}
```
<!-- .element: style="font-size: 0.4em;" -->

---

![Diagramme Concurrence en Go 1](diagram-go-concurrency-1.png)

---

![Diagramme Concurrence en Go 2](diagram-go-concurrency-2.png)

---

```go []
var solde = 100

func main() {
    var ch = make(chan int)

    go deposer(ch, 100)
    go deposer(ch, 200)

    go gererSolde(ch)

    time.Sleep(100)

    println(solde)
}

func deposer(ch chan int, montant int) {
    ch <- montant
}

func gererSolde(ch) {
    for {
        solde = solde + <-ch
    }
}
```
<!-- .element: style="font-size: 0.33em;" -->

---

## Channels

## =

## Pas de mémoire partagée

----

## Asynchronisme en JS

---

```js []
function fetchUrl(url) {
    fetch(url).then((response) => {
        response.text().then((source) => {
            console.log(source)
        })
    })
}

fetchUrl('https://mdn.io/Promise')
```

---

```js []
async function fetchUrl(url) {
    const response = await fetch(url)
    const source = await response.text()
    console.log(source)
}

fetchUrl('https://mdn.io/async/await')
```

---

```js []
let solde = 100

async function main() {
    deposer(100)
    deposer(200)

    await new Promise(resolve => setTimeout(resolve, 100))

    console.log(solde)
}

async function deposer(montant) {
    solde = solde + montant
}
```

---

## Un seul Thread

---

## Event loop

<iframe width="560" height="315" src="https://www.youtube.com/embed/cgMADL39EGs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

---

## "Run-to-completion"

---

```js []
function parseSource(source) {
    // ...
    const config = loadParserConfig()
    // ...
}

function parseUrl(url) {
    fetch(url).then((response) => {
        response.text().then(parseSource)
    })
}

parseUrl('https://mdn.io/Promise')
parseUrl('https://mdn.io/async/await')
```

---

```js []
async function parseSource(source) {
    // ...
    const config = loadParserConfig()
    // ...
}

async function parseUrl(url) {
    const response = await fetch('https://mdn.io/Promise')
    const source = await response.text()
    parseSource(source)
}

parseUrl('https://mdn.io/Promise')
parseUrl('https://mdn.io/async/await')
```

---

```js []
async function parseSource(source) {
    // ...
    const config = await loadParserConfig()
    // ...
}

async function parseUrl(url) {
    const response = await fetch('https://mdn.io/Promise')
    const source = await response.text()
    parseSource(source)
}

parseUrl('https://mdn.io/Promise')
parseUrl('https://mdn.io/async/await')
```

---

## "Run-to-completion"

## =

## Partage de mémoire sûr

---

```js []
let solde = 100

async function main() {
    deposer(100)
    deposer(200)

    await new Promise(resolve => setTimeout(resolve, 100))

    console.log(solde)
}

async function deposer(montant) {
    solde = solde + montant
}
```

----

![Go channels in JS](title.jpg)

## Inutiles donc indispensables !

----

## Comment ?

Notes:
- Quelle API ?

---

### async/await et Classes ES6

```js []
async function example() {
    const ch = new Chan()

    const v = await ch.recv()
    await ch.send(123)
}
```

---

### async/await et plain objects

```js []
async function example() {
    const ch = { /* état du channel */ }

    const v = await recv(ch)
    await send(ch, 123)
}
```

---

<!-- .slide: data-transition="convex-in none" -->

### async/await et références

```js []
async function example() {
    const ch = chan()

    const v = await recv(ch)
    await send(ch, 123)
}
```

---

<!-- .slide: data-transition="none convex-out" -->

### async/await et références

```js []
async function example() {
    const ch = chan()

    const p = recv(ch)
    await send(ch, 123)
}
```

---

### Fonctions génératrices et références

```js []
function* example() {
    const ch = chan()

    const v = yield recv(ch)
    yield send(ch, 123)
}
```

---

## ![Logo CuillereJS](cuillere-logo.png) <!-- .element: style="margin: 0 25px 0; vertical-align: middle; width: 200px;" --> CuillereJS

Framework d'exécution de fonction génératrice.

Un ami 👉 ![Valou](valou.png) <!-- .element: style="maring: 0; vertical-align: middle; width: 400px;" -->

---


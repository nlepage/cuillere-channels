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

- Bjr & bienvenue BordeauxJS
- Merci à vs connectés...
- Merci à Jérôme
- Merci Marina et Valentin
- SWITCH SCENE
- Comment implem channels Go en JS

---

![Nico Gopher](z-gopher-g.png) <!-- .element: style="margin: 0; width: 250px;" -->

## Nicolas Lepage

Consultant chez Zenika Nantes

[![Twitter logo](twitter.png) <!-- .element: style="margin: 0; vertical-align: middle; width: 60px;" --> @njblepage](https://twitter.com/njblepage)

[![Github logo](github.png) <!-- .element: style="margin: 0 15px 0 0; vertical-align: middle; width: 35px;" --> github.com/nlepage](https://github.com/nlepage)

Notes:

- Consultant Zenika Nantes (merci)

---

## Asynchronisme

Notes:

- Prog Concurrente en Go et channels
- Asynchronisme en JS
- Comprendre différences

---

## Des channels Go en JS

Notes:

- Imaginer différentes manières
- Fonctionnalités de base et avancées

---

## Exemple d'utilisation

Notes:

- Un petit exemple d'utilisation
- Peut-être démo si le temps

---

## ⚠️ Disclaimer ⚠️

Notes:

- Pas présenter super framework à utiliser demain sur votre projet
- Expérience a pour but fun et apprendre

----

## Concurrence en Go

Notes:

- Comment fait-on en Go ?
- But: gérer plusieurs tâches simultanément

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

Notes:

- main: principal...
- 2ème fonction func1
- prefixe go -> goroutine
- goroutine: processus légers, pas des threads (pas gérés par OS) mais par runtime Go
- main et func1 exécutent en même temps
- subtilité derrière en même temps...

---

![Diagramme Concurrence en Go 1](diagram-go-concurrency-1.png)

Notes:

- Selon les ressources systèmes, processeurs...
- Possible que jamais en parallèle
- ou bien...

---

![Diagramme Concurrence en Go 2](diagram-go-concurrency-2.png)

Notes:

- Vraiment en parallèle, runtime Go créé plusieurs threads

---

```go [|8|10-17|11-12|19-21|14|16||19-21]
package main

import (
    "fmt"
    "time"
)

var solde = 100

func main() {
    go deposer(100)
    go deposer(200)

    time.Sleep(100 * time.Millisecond)

    fmt.Println("Nouveau solde de", solde)
}

func deposer(montant int) {
    solde = solde + montant
}
```
<!-- .element: style="font-size: 0.38em;" -->

Notes:

- solde
- main
- go deposer
- deposer
- sleep
- print
- Sure ou pas ? risque de problème ?
- oui dans deposer, data race
- comment gérer ? mutex, verrous...

---

## Channels

Notes:

- Tuyaux pour échanger valeurs entre goroutines

---

```go [|4|6-7|17-19|9-12|]
var solde = 100

func main() {
    var depots = make(chan int)

    go deposer(depots, 100)
    go deposer(depots, 200)

    for i:= 0; i < 2; i++ {
        var depot = <-depots
        solde = solde + depot
    }

    fmt.Println("Nouveau solde de", solde)
}

func deposer(depots chan int, montant int) {
    depots <- montant
}
```
<!-- .element: style="font-size: 0.33em;" -->

Notes:

- Explication exemple...
- IMPORTANT: Envoi/réception: opérations bloquantes
- FIFO
- Avantage: Plus de sleep dans main

---

## Channels

## =

## Pas de mémoire partagée

Notes:

- Principe de base des channels

----

## Asynchronisme en JS

---

```js [|12-14|4-5|]
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

Notes:
- Promesses, async/await ou .then
- Exemple safe ?

---

## Un seul Thread

Notes:
- Aucune chance 2 fonctions en parallèle

---

## Event loop

<iframe width="560" height="315" src="https://www.youtube.com/embed/cgMADL39EGs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Notes:

- Mécanisme utilisé par moteur JS pour ordonnancer l'exécution fonctions callback

---

## "Run-to-completion"

Notes:
- Callback du then exécuté en entier

---

```js [|12-14|3-10|]
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

Notes:
- deposer: run-to-completion
- main: pas de run-to-completion

---

## "Run-to-completion"

## =

## Partage de mémoire sûr

Notes:

- A moins de faire exprès, pas de datarace
- Si on résume

----

![Go channels in JS](title.jpg)

## Inutiles donc indispensables !

---

## Comment ?

Notes:
- Quelle API ?
- Bien entendu: pas les syntaxes de Go...
- Des channels Go: Coller le plus possible ! (existe autres langages ou en JS)

---

### async/await et Classes ES6

```js []
async function example() {
    const ch = new Chan()

    const v = await ch.recv()
    await ch.send(123)
}
```

Notes:

- Méthodes sur channels bof
- Pas de véritable encapsulation (private tjrs proposition)

---

### async/await et plain objects

```js []
async function example() {
    const ch = { /* état du channel */ }

    const v = await recv(ch)
    await send(ch, 123)
}
```

Notes:

- Fonctions mieux
- État du channel ouvert à tous les vents...
- channels en go = refs

---

### async/await et références

```js []
async function example() {
    const ch = chan()

    const v = await recv(ch)
    await send(ch, 123)
}
```

Notes:

- Channels refs -> OK
- Dernier problème

---

### async/await et références

```js [|4]
async function example() {
    const ch = chan()

    const v = recv(ch)
    await send(ch, 123)
}
```

Notes:

- Send/receive pas vraiment bloquants
- Comment faire ?
- Fonctions génératrices...

---

### Fonctions génératrices et références

```js [|4]
function* example() {
    const ch = chan()

    const v = yield recv(ch)
    yield send(ch, 123)
}
```

Notes:

- Pas vraiment des fonctions
- Renvoie un générateur
- Générateurs: Object permet contrôler déroulement fonction génératrice
- Contrôler grâce au yield
- Pb: pas le faire à la main
- Vs allez rire ça tombe bien !

---

## ![Logo CuillereJS](cuillere-logo.png) <!-- .element: style="margin: 0 25px 0; vertical-align: middle; width: 200px;" --> CuillereJS

Framework d'exécution de fonction génératrice.

Un ami 👉 [![Valou](valou.png) <!-- .element: style="maring: 0; vertical-align: middle; width: 400px;" -->](https://github.com/EmrysMyrddin)

Notes:

- Valentin Cocaud
- Cuillere: framework extensible, possible ajouter nouveaux comportement via plugin

---

```js [|13|3-7|4|9-11|]
const cuillere = require('@cuillere/core')

function* helloWorld() {
    const name = yield getName()

    console.log(`Hello ${name}!`) // "Hello world!"
}

function* getName() {
    return 'world'
}

cuillere().start(helloWorld())
```

Notes:

- yield un peu comme await, avec plus de souplesse

---

```js [|4|10|19|6-7|]
let solde = 100
 
function* main() {
    const depots = chan()
 
    yield fork(deposer(depots, 100))
    yield fork(deposer(depots, 200))
 
    for (let i = 0; i < 2; i++) {
        const depot = yield recv(depots)
        solde = solde + depot
        console.log(`Dépôt de ${depot} reçu`)
    }
 
    console.log(`Nouveau solde de ${solde}`)
}
 
function* deposer(depots, montant) {
    yield send(depots, montant)
    console.log(`Dépôt de ${montant} terminé`)
}
```
<!-- .element: style="font-size: 0.38em;" -->

Notes:

- Explication exemple
- fork:
  - fourni par cuillere
  - permet démarrer génératrice dans nouvelle promesse
  - comme appeler fonction async sans await
- et enfin démarrage de notre exemple avec cuillere

---

```js [|1|3]
const cllr = cuillere(channelsPlugin())

cllr.start(main())
```

Notes:

- channelsPlugin pour gérer yield send/recv

---

[![Live coding n°1](slide_gopher_blue.png) <!-- .element: style="width: 400px;" -->](vscode://file/home/nico/git/cuillere-channels/live1.spec.js)

Notes:

- On a définit notre objectif, on se lance !
- chan()
- état FIFO
- WeakMap...
- recv factory (operation)
- plugin
- recv handler:
  - shift sender
  - promise
- send handler:
  - shift recver
  - Promise

----

## C'est tout ?

---

<!-- .slide: style="padding-left: 200px; text-align: left;" -->

### ☑ Envoi et réception
### ☐ Channel avec buffer
### ☐ Fermeture de channel
### ☐ Itération sur channel
### ☐ Select

---

## Channel avec buffer

Notes:

- Rend send/recv non bloquants
- Capacité définie
- send bloquant si buffer plein
- recv bloquant si buffer vide
- fluidifie l'exécution

---

```go [|4|6|7-9|19-21|11-14|]
var solde = 100

func main() {
    var depots = make(chan int, 5)

    var montants = []int{100, 200, 500, 1000, 600, 400, 300, 700, 900, 800}
    for _, montant := range montants {
        go deposer(depots, montant)
    }

    for range montants {
        var depot = <-depots
        solde = solde + depot
    }

    fmt.Printf("Nouveau solde de %d\n", solde)
}

func deposer(depots chan int, montant int) {
    depots <- montant
}
```
<!-- .element: style="font-size: 0.38em;" -->

---

```js [|4|6|7-9|11-15|]
let solde = 100
 
function* main() {
    const depots = chan(5)
 
    const montants = [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]
    for (const montant of montants) {
        yield fork(deposer(depots, montant))
    }
    
    for (let i = 0; i < montants.length; i++) {
        const depot = yield recv(depots)
        solde = solde + depot
        console.log(`Dépôt de ${depot} reçu`)
    }
 
    console.log(`Nouveau solde de ${solde}`)
}

function* deposer(depots, montant) {
    yield send(depots, montant)
    console.log(`Dépôt de ${montant} terminé`)
}
```
<!-- .element: style="font-size: 0.34em;" -->

---

[![Live coding n°2](chasing_gophers.png) <!-- .element: style="width: 400px;" -->](vscode://file/home/nico/git/cuillere-channels/live2.spec.js)

Notes:
- Modif chan: capacity=0, buffer, bufferLength
- handler send:
  - Si recvers dans recvQ, n'ont rien trouvé dans buffer, donc déjà OK
  - recvQ vide -> buffer plein ?
- handler recv:
  - D'abord buffer pr respecter FIFO
  - copyWithin(0, 1) + bufferLength-- + return value
  - Place libérée dans le buffer
  - shift sender etc.
  - refacto

----

<!-- .slide: style="padding-left: 200px; text-align: left;" -->

### ☑ Envoi et réception
### ☑ Channel avec buffer
### ☐ Fermeture de channel
### ☐ Itération sur channel
### ☐ Select

---

## Fermeture de channel

Notes:

- Normalement côté sender
- Prévenir receivers que plus rien à recevoir
- Opération définitive (pas de réouverture)

---

```go [|6|19-24|23|8-14|9|10-12|]
var solde = 100

func main() {
    var depots = make(chan int, 5)

    go deposer(depots, []int{100, 200, 500, 1000, 600, 400, 300, 700, 900, 800})

    for {
        var depot, ok = <-depots
        if !ok {
            break
        }
        solde = solde + depot
    }

    fmt.Printf("Nouveau solde de %d\n", solde)
}

func deposer(depots chan int, montants []int) {
    for _, montant := range montants {
        depots <- montant
    }
    close(depots)
}
```
<!-- .element: style="font-size: 0.33em;" -->

---

```js [|6|18-23|22|8-13|9|10|]
let solde = 100

function* main() {
    const depots = chan(5)

    yield fork(deposer(depots, [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]))

    while (true) {
        const [depot, ok] = yield recv(depots, true)
        if (!ok) break
        solde = solde + depot
        console.log(`Dépôt de ${depot} reçu`)
    }

    console.log(`Nouveau solde de ${solde}`)
}

function* deposer(depots, montants) {
    for (const montant of montants) {
        yield send(depots, montant)
    }
    close(depots)
}
```
<!-- .element: style="font-size: 0.34em;" -->

---

## Les règles

- On peut encore recevoir
- On ne peut plus envoyer
- On ne peut fermer qu'une seule fois

---

[![Live coding n°3](scooter_gopher_blue.png) <!-- .element: style="width: 400px;" -->](vscode://file/home/nico/git/cuillere-channels/live3.spec.js)

Notes:

- chan: ajout closed
- close: implem sans drain (FIXME)
- detail:
  - recv factory
  - recv handler (x3)
  - send handler (appel recver)
- closed:
  - send handler
  - recv handler (avant Promise)
- close: drain recvQ

----

<!-- .slide: style="padding-left: 200px; text-align: left;" -->

### ☑ Envoi et réception
### ☑ Channel avec buffer
### ☑ Fermeture de channel
### ☐ Itération sur channel
### ☐ Select

---

## Itération sur channel

---

```go [|8-10]
var solde = 100

func main() {
    var depots = make(chan int, 5)

    go deposer(depots, []int{100, 200, 500, 1000, 600, 400, 300, 700, 900, 800})

    for depot := range depots {
        solde = solde + depot
    }

    fmt.Printf("Nouveau solde de %d\n", solde)
}

func deposer(depots chan int, montants []int) {
    for _, montant := range montants {
        depots <- montant
    }
    close(depots)
}
```
<!-- .element: style="font-size: 0.4em;" -->

Notes:

- Pas vraiment feature, plutôt syntaxe
- itère jusqu'à ce que channel fermé et plus de valeur
- Pas vraiment de syntaxe équivalente en JS

---

```js [|8-11]
let solde = 100

function* main() {
    const depots = chan(5)

    yield fork(deposer(depots, [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]))

    for (let [depot, ok] = yield recv(depots, true); ok; [depot, ok] = yield recv(depots, true)) {
        solde = solde + depot
        console.log(`Dépôt de ${depot} reçu`)
    }

    console.log(`Nouveau solde de ${solde}`)
}

function* deposer(depots, montants) {
    for (const montant of montants) {
        yield send(depots, montant)
    }
    close(depots)
}
```
<!-- .element: style="font-size: 0.36em;" -->

Notes:
- Encore moins lisible que le while true...

---

### `for...of`

```js []
for (const valeur of itérable) {
    console.log(valeur)
}
```

Notes:

- Expliquer itérable

---

### ES2018 : `for await...of`

```js []
for await (const valeur of iterableAsynchrone) {
    console.log(valeur)
}
```

---

```js [|8-11]
let solde = 100

function* main() {
    const depots = chan(5)

    yield fork(deposer(depots, [100, 200, 500, 1000, 600, 400, 300, 700, 900, 800]))

    for await (const depot of range(depots)) {
        solde = solde + depot
        console.log(`Dépôt de ${depot} reçu`)
    }

    console.log(`Nouveau solde de ${solde}`)
}

function* deposer(depots, montants) {
    for (const montant of montants) {
        yield send(depots, montant)
    }
    close(depots)
}
```
<!-- .element: style="font-size: 0.38em;" -->

---

[![Live coding n°4](swing_gophers.png) <!-- .element: style="width: 400px;" -->](vscode://file/home/nico/git/cuillere-channels/live4.spec.js)

----

<!-- .slide: style="padding-left: 200px; text-align: left;" -->

### ☑ Envoi et réception
### ☑ Channel avec buffer
### ☑ Fermeture de channel
### ☑ Itération sur channel
### ☐ Select

---

## Select

---

```go [|6-7|8-9]
func main() {
    var ch1 = make(chan int)
    var ch2 = make(chan string)

    select {
    case ch1 <- 123:
        fmt.Println("Entier envoyé !")
    case ch2 <- "foo":
        fmt.Println("Chaîne envoyée !")
    }
}
```

---

```go [|6-7|8-9]
func main() {
    var ch1 = make(chan int)
    var ch2 = make(chan string)

    select {
    case value := <-ch1:
        fmt.Printf("Entier %d reçu\n", value)
    case value := <-ch2:
        fmt.Printf("Chaîne \"%s\" reçue\n", value)
    }
}
```

---

```go [|5-6|7-8]
func main() {
    var ch = make(chan int)

    select {
    case ch <- 123:
        fmt.Println("Entier envoyé !")
    default:
        fmt.Println("Envoi impossible !")
    }
}
```

---

```go [|5-6|7-8]
func main() {
    var ch = make(chan int)

    select {
    case ch <- 123:
        fmt.Println("Entier envoyé !")
    case <-time.After(10 * time.Second):
        fmt.Println("Timeout !")
    }
}
```

Notes:

- Comme le range pas de syntaxe en JS
- Comment faire ?

---

```js [|5-8|10-17]
function* main() {
    const ch1 = chan()
    const ch2 = chan()

    const [i, value] = yield select(
        recv(ch1),
        recv(ch2),
    )

    switch (i) {
    case 0:
        console.log(`Entier ${value} reçu`)
        break
    case 1:
        console.log(`Chaîne "${value}" reçue`)
        break
    }
}
```
<!-- .element: style="font-size: 0.42em;" -->

---

```js [|5-8]
function* main() {
    const ch1 = chan()
    const ch2 = chan()

    const [i] = yield select(
        send(ch1, 123),
        send(ch2, 'foo'),
    )

    switch (i) {
    case 0:
        console.log('Entier envoyé !')
        break
    case 1:
        console.log('Chaîne envoyée !')
        break
    }
}
```
<!-- .element: style="font-size: 0.42em;" -->

---

```js [|7]
function* main() {
    const ch1 = chan()
    const ch2 = chan()

    const [i] = yield select(
        send(ch1, 123),
        select.default,
    )

    switch (i) {
    case 0:
        console.log('Entier envoyé !')
        break
    default:
        console.log('Envoi impossible !')
        break
    }
}
```
<!-- .element: style="font-size: 0.42em;" -->

Notes:
- Vraiment pas très pratique
- Découpé en 2, yield select, puis switch

---

```js [|6-8]
function* main() {
    const ch1 = chan()
    const ch2 = chan()

    yield select(
        [recv(ch1), (value) => {
            console.log(`Entier ${value} reçu`)
        }],
        [recv(ch2), (value) => {
            console.log(`Chaîne "${value}" reçue`)
        }],
    )
}
```
<!-- .element: style="font-size: 0.54em;" -->

Notes:

- Et même callback génératrice

---

```js [|6-8]
function* main() {
    const ch1 = chan()
    const ch2 = chan()

    yield select(
        [recv(ch1), function*(value) {
            yield send(ch2, `${value}`)
        }],
        [recv(ch2), (value) => {
            console.log(`Chaîne "${value}" reçue`)
        }],
    )
}
```
<!-- .element: style="font-size: 0.52em;" -->

---

[![No demo !](asleep_2.png) <!-- .element: style="width: 400px;" -->](vscode://file/home/nico/git/cuillere/channels/src/index.ts:48)

---

## Une ou des opérations sont-elles prêtes ?

---

## Une opération est prête
## 👇
## Elle est déclenchée

---

## Plusieurs opérations sont prêtes
## 👇
## Une opération au hasard est déclenchée

---

## Aucune opération n'est prête
## 👇
## Est-ce qu'il y a un default ?

---

## Il y a un default
## 👇
## Il est déclenché

---

## Il n'y a pas de default
## 👇
## On attend que l'une des opérations soit prête

----

<!-- .slide: style="padding-left: 200px; text-align: left;" -->

### ☑ Envoi et réception
### ☑ Channel avec buffer
### ☑ Fermeture de channel
### ☑ Itération sur channel
### ☑ Select

---

## Exemple d'utilisation

---

[![Logo envelope](envelope_logo.gif)](https://github.com/tgirier/envelope) <!-- .element: target="_blank" -->

---

## [@cuillere/envelope 🥄📨](vscode://file/home/nico/git/envelope/src/envelope.ts:10) <!-- .element: target="_blank" -->

Notes:

- Écrit en TS !
- 3 channels...
- run...
- listen...
- handle...

----

![Merci !](heart_gopher.png) <!-- .element: style="width: 200px;" -->

### [nlepage.github.io/cuillere-channels](https://nlepage.github.io/cuillere-channels/#/)
### [dev.to/nlepage](https://dev.to/nlepage)

---

![?](question_mark.png) <!-- .element: style="margin-bottom: 0; width: 60px;" -->

![gopher](facing_gopher.png) <!-- .element: style="margin-top: 0; width: 200px;" -->

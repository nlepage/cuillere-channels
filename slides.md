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
---

![Go channels in JS](title.jpg)

Notes:

---

![Nico Gopher](z-gopher-g.png) <!-- .element: style="margin: 0; width: 250px;" -->

## Nicolas Lepage

Développeur chez Zenika Nantes

[![Twitter logo](twitter.png) <!-- .element: style="margin: 0; vertical-align: middle; width: 60px;" --> @njblepage](https://twitter.com/njblepage)

[![Github logo](github.png) <!-- .element: style="margin: 0 15px 0 0; vertical-align: middle; width: 35px;" --> github.com/nlepage](https://github.com/nlepage)

---

## Asynchronisme

note:
Concurrence en Go et channels
Asynchronisme en JS, promesses, async/await, event-loop
Quels différences ?

---

## Des channels Go en JS

note:
Différentes manières d'implémenter
Implémenter fonctionnalités de base et avancées

---

## Exemple d'utilisation

---

## Disclaimer

note:
blabla

----

## Concurrence en Go

---

```golang [|1,4|6-8|2|]
func main() {
    go func1()
    // ...
}

func func1() {
    // ...
}
```

---

```golang []
var solde = 100

func main() {
    go deposer(100)
    go deposer(200)
    println(solde)
}

func deposer(montant int) {
    solde = solde + montant
}
```

---

![Diagramme Concurrence en Go 1](diagram-go-concurrency-1.png)

---

![Diagramme Concurrence en Go 2](diagram-go-concurrency-2.png)

---


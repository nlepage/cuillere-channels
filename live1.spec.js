const { cuillere, fork } = require('@cuillere/core')
const { channelsPlugin, chan, send, recv } = require('./live1')

describe('Live 1', () => {
    it('On doit pouvoir créer un channel, et envoyer et recevoir dessus', async () => {
        let solde = 100
 
        function* main() {
            const depots = chan()
            console.log(depots)
        
            yield fork(deposer(depots, 100))
            yield fork(deposer(depots, 200))
        
            for (let i = 0; i < 2; i++) {
                const depot = yield recv(depots)
                solde = solde + depot
            }
        
            console.log(`Nouveau solde de ${solde}`)
        }
        
        function* deposer(depots, montant) {
            yield send(depots, montant)
            console.log(`Dépôt de ${montant} terminé`)
        }

        const cllr = cuillere(channelsPlugin())

        await cllr.start(main())

        expect(solde).toBe(400)
    })
})


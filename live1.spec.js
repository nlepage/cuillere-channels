const { cuillere, fork, sleep } = require('@cuillere/core')
const { channelsPlugin, chan, send, recv } = require('./live1')

describe('Création, envoi et réception', () => {
    it('doit pouvoir créer, envoyer et recevoir sur un channel', async () => {
        let solde = 100
 
        function* main() {
            const depots = chan()
        
            yield fork(deposer(depots, 100))
            yield fork(deposer(depots, 200))
        
            yield fork(gererSolde(depots))
        
            yield sleep(100)
        
            console.log(solde)
        }
        
        function* deposer(depots, montant) {
            yield send(depots, montant)
        }
        
        function* gererSolde(depots) {
            for (let i = 0; i < 2; i++) {
                const depot = yield recv(depots)
                solde = solde + depot
            }
        }

        const cllr = cuillere(channelsPlugin())

        await cllr.start(main())

        expect(solde).toBe(400)
    })
})


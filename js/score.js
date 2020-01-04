//********************************************************************************************/
//*                            GESTION DU SCORE                                              */
//*==========================================================================================*/
//*   La variable scoreJeu référence un objet dont les propriétés et méthodes permettent:    */   
//*   - de tenir le score des blasons retrouvés et des gamelles prises                       */
//*   - d'afficher le score à chaque modification                                            */
//*   - d'afficher la page proposant de rejouer quand la partie est terminée                 */
//*   - d'afficher les blasons au fur et à mesure qu'ils sont retrouvés                      */
//*                                                                                          */
//*   L'image des blasons sont dans une feuille de sprites de mêmes dimensions.              */
//*   Un objet blason, propriété de scoreJeu, contient les dimensions d'un sprite            */ 
//********************************************************************************************/

var scoreJeu = {

    blason: { width: 75, height: 91 },
    nbBlasons: 12,
    nbGamellesMax: 5,
    nbBlasonsRetrouves: 0,
    nbGamelles: 0,
    gagne: false,
    perdu: false,
    son: {
        jouer: document.getElementById('sonJouer'),
        blason: document.getElementById('sonBlason'),
        gamelle: document.getElementById('sonGamelle'),
        gagne: document.getElementById('sonGagne'),
        perdu: document.getElementById('sonPerdu')
    },

    // Méthode pour afficher les blasons gagnés suite à une attaque d'Arthur
    afficheBlason: function () {
        $('#blasonsMasque').width(this.nbBlasonsRetrouves * this.blason.width);
    },

    // Méthode pour afficher le nombre de blasons gagnés et les gamelles prises par Arthur
    afficheScore: function () {
        $('#nbBlasons').html(this.nbBlasonsRetrouves + ' / ' + this.nbBlasons);
        $('#nbGamelles').html(this.nbGamelles + ' / ' + this.nbGamellesMax);

        // la partie est terminée, on propose de rejouer
        if (this.gagne || this.perdu) {
            clavier.actif = false;
            clavier.reinitTouches();
            this.proposeRejeu();
        }
    },

    // Méthode d'incrément du nombre de blasons retrouvés
    incrementBlasons: function (nombre) {
        this.nbBlasonsRetrouves += nombre;
        if (this.nbBlasonsRetrouves >= this.nbBlasons) {
            this.nbBlasonsRetrouves = this.nbBlasons;
            this.gagne = true;
        }
        this.son.blason.play();
        this.afficheBlason();
        this.afficheScore();
    },

    // Méthode d'incrément du nombre de gamelles prises
    incrementGamelles: function () {
        this.nbGamelles++;
        if (this.nbGamelles == this.nbGamellesMax) {
            this.perdu = true;
        }
        this.son.gamelle.play();
        this.afficheScore();
    },

    initialisation: function () {
        this.nbBlasonsRetrouves = 0;
        this.nbGamelles = 0;
        this.gagne = false;
        this.perdu = false;
    },

    // Méthode appelée pour afficher la page proposant de rejouer
    proposeRejeu: function () {
        var resultat = this.gagne ? 'Ouééé !' : 'Aaargh !';
        this.afficherPageRejeu();
        $('#resultat').html(resultat);
        if (this.gagne) {
            this.son.gagne.play();
            $('#imgMonCv').addClass('yoyo');
        } else {
            this.son.perdu.play();
        }

    },

    // Méthode appelée pour mettre fin immédiatement à la partie quand Arthur un coup de cornes 
    rejeuDirect: function () {
        this.son.gamelle.play();
        this.perdu = true;
        this.afficheScore();
    },

    // Méthode appelée pour repositionner les personnages après une collision ou fin de partie
    repositionPersonnages: function () {

        // La partie n'est pas terminée
        if ((scoreJeu.perdu) || (scoreJeu.gagne)) {
            //on repositionne les personnages
            initPositionPersonnages();
            return;
        }

        // Collision avec Georges
        if (collision.avecGeorges) {
            //on repositionne les personnages
            initPositionPersonnages();
            intervalIdDeplacementsGeorges = setInterval(piloteDeplacementsGeorges, georges.vitesse);
        }

        // réactivation du clavier, cela permet de mettre Arthur automatiquement en attente.
        clavier.actif = true;
        clavier.touches.keyup = true;

    },
     // Fonction d'affichage de la page de rejeu
     afficherPageRejeu: function () {
        $('#rejouer').css('display', 'flex').height($('#scene').height()).width($('#scene').width());
    }

};

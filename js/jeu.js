'use strict'

//**********************************************************************************************/
//*                     PRINCIPES DU JEU                                                       */
//*============================================================================================*/ 
//*  Pour gagner à ce jeu, Arthur doit récupérer les 12 blasons volés par Georges.             */
//*  Il doit affronter Georges et lui porter des coups pour les reprendre progressivement      */ 
//*  Arthur perd le jeu s'il est encorné par Georges ou s'il cumule 5 gamelles.                */ 
//*                                                                                            */
//*  Les coups gagnants :                                                                      */
//*  --------------------                                                                      */
//*  1) Georges n'est pas en position d'attaque, Arthur l'attaque et l'atteint :               */
//*     - de face : 2 blasons gagnés                                                           */
//*     - par derrière : 2 blasons gagnés                                                      */
//*  2) Arthur saute, retombe sur Georges et évite ses cornes : 3 blasons gagnés               */
//*                                                                                            */
//*  Les cas de gamelle :                                                                      */
//*  -------------- -----                                                                      */
//*  1) Arthur se cogne contre un mur                                                          */
//*  2) Arthur percute Georges sans l'attaquer (sauf coup fatal ci-dessous)                    */  
//*                                                                                            */
//*  Coup fatal, l'encornage par Georges :                                                     */
//*  -------------------------------------                                                     */ 
//*  1) Arthur attaque ou percute Georges alors que celui-ci est en position d'attaque         */
//*  2) Arthur saute et retombe sur les cornes relevées de Georges                             */
//*  Dans ces 2 cas la partie est perdue pour Arthur.                                          */
//**********************************************************************************************/

$(function () {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    //*************************************************************************************************/
    //*                     LA GESTION DES PERSONNAGES ARTHUR ET GEORGES                              */
    //*===============================================================================================*/
    //*  La technique des sprites est utilisée ici pour déplacer les personnages.                     */
    //*  Ainsi, une feuille de sprites et un masque d'affichage sont associés à chaque personnage.    */
    //*  Pour exploiter les sprites, chaque personnage est représenté par un objet qui contient les   */
    //*  propriétés permettant de gérer leur déplacement selon l'action engagée :                     */
    //*                                                                                               */
    //*  - l'orientation des sprites du personnage, ceux d'Arthur le sont vers la droite, ceux de     */       //*    Georges vers la gauche                                                                     */
    //*  - la direction du déplacement en cours                                                       */
    //*  - pour chaque action que peut engager le personnage, il y a:                                 */ 
    //*    . une table des positions et tailles des sprites concernés                                 */
    //*    . le statut de l'action                                                                    */
    //*    . le nombre de pixels pour un pas de déplacement, dans le cas du saut en demi-cercle       */       //*      ce sont des radians                                                                      */
    //*    . un booléen(*) qui indique si on reboucle sur le 1er sprite quand on arrive au dernier    */
    //*      sprite de la table                                                                       */
    //*    . en cas de rebouclage(*), le nombre de rebouclages                                        */
    //*    . une vitesse si l'action est déroulée avec une fonction répétée (avec setInterval).       */ 
    //*                                                                                               */
    //*  Il y a aussi des méthodes d'initialisation des propriétés.                                   */
    //*                                                                                               */
    //*  Pour dérouler une action, on accède à sa table de sprites et on la parcourt pour exécuter    */
    //*  un pas par sprite :                                                                          */
    //*  - ajustement du masque d'Arthur avec les dimensions du sprite accédé                         */       //*  - positionnement du sprite dans le masque                                                    */       //*  - déplacement du masque selon le pas indiqué (le pas peut être nul)                          */
    //*                                                                                               */
    //*  Le déplacement des personnages est géré de deux façons selon l'action :                      */
    //*  - chaque pas est déclenché indépendemment, ex. sur l'action "court", Arthur avance d'un pas  */
    //*    à chaque appui d'une touche directionnelle droite/gauche                                   */  
    //*  - tous les pas de l'action sont déroulés d'un coup, ex. sur l'action "attaque", tous les     */
    //*    sont déroulés à l'appui de la touche espace .                                              */
    //*  (*) c'est pour le 2ème cas que l'on gère la notion de rebouclage.                            */  
    //*************************************************************************************************/

    //*============================================================================================*/
    //*                 GESTION D'ARTHUR                                                           */
    //*--------------------------------------------------------------------------------------------*/
    //*  Les propriétés du personnage d'Arthur doivent permettre de gérer ses actions: Arthur      */
    //*  attaque, attend, est content, court, est ko, saute et vacille.                            */
    //*                                                                                            */
    //*  Une action est déclenchée par l'appui d'une touche ou par une situation de collision :    */
    //*  on accède à la table des sprites de l'action qui sera parcourue pour exécuter le          */
    //*  déplacement.                                                                              */
    //*                                                                                            */
    //*  1) L'appui d'une touche permet de faire un pas :                                          */
    //*  - à chaque appui on accède au sprite suivant. Quand le dernier est atteint, on retourne   */
    //*    au 1er. Ex. de l'action "court" avec les flêches directionnelles droite/gauche          */
    //*                                                                                            */  
    //*  2) L'appui d'une touche déclenche le déroulement complet d'une action : nécessite donc la */          //*  répétition de l'éxécution d'un pas.                                                       */
    //*  La répétition prend fin quand :                                                           */
    //*    . le dernier sprite est atteint, ex. action "saut" avec la flêche vers le haut          */
    //*    . tous les sprites ont été parcourus un nombre déterminé de fois (rebouclage),          */
    //*      ex. action "attaque" avec la barre espace                                             */ 
    //*  Une propriété de l'action, nombre de boucles, permet de gérer le rebouclage.              */
    //*  Une propriété de l'action, vitesse, indique le délai à appliquer entre chaque répétion.   */ 
    //*                                                                                            */
    //*  3) Une collision déclenche le déroulement complet d'une action, de la même façon que      */
    //*  décrit ci-dessus. Ex. des actions "content" quand Arthur attaque Georges avec succès,     */ 
    //*  "ko" quand il est encorné, "vacille" quand il percute un mur ou Georges.                  */
    //*                                                                                            */
    //*  4) Cas particulier : l'action "attend" est déclenchée quand aucune touche n'est appuyée.  */
    //*  Une fonction répétée prend en charge l'action et la répétition se termine quand une       */
    //*  touche d'action est appuyée.                                                              */
    //*                                                                                            */
    //*  Les actions concernées ont leur fonction répétée spécifique.                              */
    //*                                                                                            */
    //*  Toutes ces opérations sont pilotées par la fonction "pitoteDeplacementsArthur" qui :      */
    //*  - détermine l'action à engager selon les touches appuyées                                 */
    //*  - appelle l'exécution d'un pas                                                            */
    //*  - appelle le déroulement complet d'une action                                             */
    //*  - appelle la détection des collisions                                                     */
    //*  Cette fonction est appelée en mode répétition (setInterval) au démarrage du jeu.          */ 
    //*============================================================================================*/

    var ArthurPersonnage = function () {
        this.actionPrecedente = null;

        // sens de déplacement de l'action en cours
        this.direction = {
            droite: true, gauche: false
        };
        // sprites orientés vers la droite
        this.orientation = 1;

        // L'action "attaque" est déclenchée par la touche entrée et est déroulée par un setInterval. Arrivé au dernier sprite on reboucle.
        this.attaque = {
            sprites: [
                { top: 30, left: -792, width: 118, height: 124 },
            ],
            statut: false,
            pas: 5,
            boucle: true,
            nbBoucles: 30,
            vitesse: 5
        };

        // L'action "attente" est déclenchée quand aucune touche n'est appuyée, elle est déroulée avec un setInterval et s'arrête dès qu'une touche est appuyée
        this.attend = {
            sprites: [
                // les sprites sont répétés pour ne pas mettre une vitesse trop lente. Quand la vitesse est lente, Arthur parait figé le temps que l'attente se mette en place.
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
            ],
            statut: true,
            pas: 0,
            boucle: true,
            vitesse: 100
        };

        // L'action "content" est déclenchée suite à une attaque réussie et est déroulée par un setInterval. Arrivé au dernier sprite on reboucle.
        this.content = {
            sprites: [
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
            ],
            statut: false,
            pas: 0,
            boucle: true,
            nbBoucles: 10,
            vitesse: 80
        };

        // L'action "court" est déclenché" par les touches flêches droite/gauche, à chaque appui Arthur se déplacement d'un pas. Quand on arrive au dernier sprite on reboucle.
        this.court = {
            sprites: [
                { top: 0, left: -173, width: 86, height: 125 },
                { top: 0, left: -260, width: 86, height: 125 },
                { top: 0, left: -346, width: 86, height: 125 },
                { top: 0, left: -434, width: 85, height: 125 },
                { top: 0, left: -521, width: 85, height: 125 }
            ],
            statut: false,
            pas: 5,
            boucle: true,
            vitesse: 0
        };

        // Le mouvement mise KO d'Arthur est déclenché quand il y a collision avec les cornes de Georges. Il est déroulé avec un setInterval qui prend fin au dernier sprite.
        this.ko = {
            sprites: [
                { top: 0, left: -911, width: 96, height: 143 },
                { top: 0, left: -1006, width: 96, height: 143 },
                { top: 0, left: -911, width: 96, height: 143 },
                { top: 0, left: -1006, width: 96, height: 143 },
                { top: -143, left: 0, width: 96, height: 125 },
                { top: -143, left: -157, width: 107, height: 125 },
                { top: -143, left: -324, width: 118, height: 125 },
                { top: -143, left: -477, width: 117, height: 125 },
                { top: -143, left: -627, width: 117, height: 125 },
            ],
            statut: false,
            pas: -4,
            boucle: false,
            vitesse: 100
        };
        // Le mouvement de saut est déclenché par une touche, déroulé avec un setInterval qui prend fin au dernier sprite. C'est un déplacement en demi-cercle selon un centre (x,y), le rayon et l'angle de départ, tous des propriétés du saut. Pour la gestion de la collision avec Georges, on distingue la phase ascendante et la descendante également propriétés du saut. Enfin, le pas est en radians. 

        this.saute = {
            // il n'y a que 2 sprites pour le saut (ascension, descente). Ils sont répétés pour avoir un sprite pour chaque pas de PI/30
            sprites: [
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -611, width: 85, height: 128 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 0, left: -699, width: 94, height: 130 },
                { top: 2, left: -2, width: 83, height: 125 },
            ],
            statut: false,
            boucle: false,
            vitesse: 20,
            // les propriétes suivantes permettent de calculer un déplacement en demi-cercle pour faire le saut
            pas: Math.PI / 30,
            x0: 0,
            y0: 0,
            angle0: Math.PI, // angle de départ, il est initialisé à 2PI quand Arthur va à gauche
            rayon: 142,
            ascension: false, // initialisé à true au départ du saut, passe à false à la fin de cette phase
            descente: false, // initialisé à false au départ du saut, passe à true à la fin de l'ascension
            angleFinAscension: Math.PI + Math.PI / 2 //détermine la fin de la phase d'ascension
        };

        // L'action "vacille" est déclenchée quand Arthur percute un mur ou Georges et déroulée avec un setInterval(). Arrivé au dernier sprite on reboucle.
        this.vacille = {
            sprites: [
                { top: 0, left: -911, width: 96, height: 143 },
                { top: 0, left: -1006, width: 96, height: 143 },
            ],
            statut: false,
            pas: 0,
            boucle: true,
            nbBoucles: 5,
            vitesse: 100
        };

        // méthode d'initialisation des directions droite/gauche
        this.initDirection = function (droite, gauche) {
            this.direction.droite = droite;
            this.direction.gauche = gauche;
        };

        // méthode d'initialisation du statut des actions
        this.initStatuts = function () {
            this.attaque.statut = false;
            this.attend.statut = false;
            this.content.statut = false;
            this.court.statut = false;
            this.ko.statut = false;
            this.saute.statut = false;
            this.vacille.statut = false;
        };

    };

    //*============================================================================================*/
    //*                GESTION DE GEORGES                                                          */
    //*--------------------------------------------------------------------------------------------*/
    //*  Les propriétés du personnage de Georges doivent permettre de gérer ses actions: Georges   */
    //*  attaque, attend, court, est applati et vacille.                                           */
    //*                                                                                            */
    //*  Les actions de Georges sont déclenchées par le démarrage d'une partie de jeu ou par une   */
    //*  collision.                                                                                */
    //*  Comme pour Arthur, on accède à la table des sprites de l'action qui sera parcourue pour   */
    //*  exécuter le déplacement.                                                                  */
    //*                                                                                            */
    //*  Une fonction spécifique à Georges, "piloteDeplacementsGeorges" va piloter les différentes */ 
    //*  opérations de déplacement. Elle est appelée de façon répétitive (setInterval) au          */
    //*  démarrage du jeu.                                                                         */
    //*                                                                                            */
    //*  1) Georges "court" au démarrage du jeu et, selon la position d'Arthur, l'"attaque" quand  */
    //*  il est à sa portée ou fait demi-tour si Arthur est dans son dos                           */
    //*                                                                                            */
    //*  2) Il fait demi-tour en cas de collision avec un mur.                                     */ 
    //*                                                                                            */
    //*  3) Une collision avec Arthur interrompt la fonction pilote et déclenche le déroulement    */
    //*  complet d'une action :                                                                    */
    //*  - Georges "attend" après qu'Arthur l'ait percuté                                          */
    //*  - il "vacille" si Arthur l'attaque avec succès                                            */
    //*  - il est "applati" si Arthur lui saute sur le dos.                                        */
    //*  Comme pour Arthur, le déroulement complet d'une action est l'exécution répétée d'un pas   */          //*  de déplacement.                                                                           */
    //*  La fonction pilote reprend la main quand le traitement de la collision est terminée.      */
    //*============================================================================================*/

    var GeorgesPersonnage = function () {

        this.actionPrecedente = null;
        // sens de déplacement en cours
        this.direction = {
            droite: false, gauche: true
        };
        this.vitesse = 42,
            // les sprites de Georges sont tous orientés vers la gauche
            this.orientation = -1,

            // Georges s'applatit quant Arthur lui saute sur le dos (collision)
            this.applati = {
                sprites: [
                    { top: -305, left: -832, width: 115, height: 105 },
                    { top: -305, left: -987, width: 122, height: 105 },
                    { top: -307, left: -1143, width: 128, height: 102 },
                    { top: -307, left: -1303, width: 133, height: 102 },
                    { top: -322, left: -1460, width: 139, height: 89.5 },
                    { top: -320, left: -1620, width: 139, height: 89.5 },
                    { top: -317.5, left: -1775, width: 143, height: 96 },
                    { top: -317.5, left: -1935, width: 148, height: 95 }
                ],
                statut: false,
                pas: 0,
                boucle: false,
                vitesse: 80
            };

        // Georges attaque quand Arthur est à sa portée
        this.attaque = {
            sprites: [

                { top: 0, left: -804, width: 109, height: 91 },
                { top: 0, left: -957, width: 110, height: 91 },
                { top: 0, left: -1110, width: 111, height: 91 },
                { top: 0, left: -1236, width: 139, height: 91 },
                { top: 0, left: -1391, width: 139, height: 91 },
                { top: 0, left: -1549, width: 134, height: 91 },
                { top: 0, left: -1702, width: 135, height: 91 },
                { top: 0, left: -1857, width: 134, height: 91 },
                { top: 0, left: -2012, width: 133, height: 91 },
                { top: 0, left: -2166, width: 133, height: 91 }
            ],
            statut: false,
            pas: 1,
            boucle: false,
            nbBoucles: 2,
            vitesse: 0
        };

        // Georges attend au début de la partie et de chaque round (mais pas longtemps)
        this.attend = {
            sprites: [
                { top: -100, left: -2, width: 103, height: 99 },
                { top: -100, left: -107, width: 103, height: 99 },
                { top: -100, left: -212, width: 103, height: 99 },
                { top: -100, left: -317, width: 103, height: 99 },
                { top: -100, left: -422, width: 103, height: 99 },
                { top: -100, left: -527, width: 103, height: 99 },
                { top: -100, left: -632, width: 103, height: 99 },
                { top: -100, left: -737, width: 103, height: 99 },
                { top: -100, left: -842, width: 103, height: 99 },
                { top: -100, left: -947, width: 103, height: 99 },
                { top: -100, left: -1052, width: 103, height: 99 },
                { top: -100, left: -1157, width: 103, height: 99 },
                { top: -100, left: -1262, width: 103, height: 99 },
                { top: -100, left: -1367, width: 103, height: 99 },
                { top: -100, left: -1472, width: 103, height: 99 }
            ],
            statut: true,
            pas: 0,
            boucle: true,
            vitesse: 50
        };

        // Georges court dès que la partie ou le round démarre, il cesse quand Arthur est à sa portée pour attaquer
        this.court = {
            sprites: [
                { top: -415, left: -14, width: 101, height: 93 },
                { top: -417, left: -132, width: 105, height: 93 },
                { top: -419, left: -251, width: 107, height: 95 },
                { top: -421, left: -369, width: 112, height: 94 },
                { top: -421, left: -494, width: 108, height: 91 },
                { top: -421, left: -619, width: 104, height: 89 },
                { top: -421, left: -743, width: 104, height: 91 },
                { top: -421, left: -872, width: 101, height: 92 },
                { top: -421, left: -999, width: 102, height: 92 },
                { top: -421, left: -1127, width: 103, height: 92 },
                { top: -419, left: -1248, width: 102, height: 94 },
                { top: -417, left: -1369, width: 101, height: 96 },
                { top: -416, left: -1490, width: 101, height: 96 },
            ],
            statut: false,
            pas: 7,
            boucle: true,
            vitesse: 0
        };

        // Georges vacille quand Arthur lui porte un coup de face ou par derrière 
        this.vacille = {
            sprites: [
                { top: -204, left: -2.5, width: 93, height: 96 },
                { top: -204, left: -126, width: 91, height: 96 },
                { top: -202, left: -250, width: 91, height: 96 },
                { top: -202, left: -372, width: 92, height: 98.5 },
                { top: -202, left: -495, width: 92, height: 98.5 },
                { top: -202, left: -616, width: 95, height: 98.5 },
                { top: -202, left: -737, width: 97, height: 98.5 },
                { top: -202, left: -858, width: 101, height: 98 },
                // attend
                { top: -100, left: -2, width: 103, height: 99 },
            ],
            statut: false,
            pas: 0,
            boucle: true,
            nbBoucles: 2,
            vitesse: 30
        };

        this.initDirection = function (droite, gauche) {
            this.direction.droite = droite;
            this.direction.gauche = gauche;
        };

        this.initStatuts = function () {
            this.applati.statut = false;
            this.attaque.statut = false;
            this.attend.statut = false;
            this.court.statut = false;
            this.vacille.statut = false;
        };

    };

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
            $blasonsMasque.width(this.nbBlasonsRetrouves * this.blason.width);
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
            afficherPageRejeu();
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

        }

    };
    //********************************************************************************************/
    //*                            GESTION DES COLLISIONS                                        */
    //*==========================================================================================*/
    //*  Les collisions suivantes sont détectées et gérées :                                     */
    //*                                                                                          */
    //*  - contre les murs:                                                                      */
    //*    . Arthur "court" ou "saute" et se mange le mur: il prend une gamelle et "vacille"     */
    //*    . Georges "court" et approche un mur: il fait demi-tour.                              */
    //*                                                                                          */            //*  - entre Arthur et Georges:                                                              */            //*    . Si Georges encorne Arthur (quoi que ce dernier fasse), celui-ci est "ko", Georges   */ 
    //*      "attend" et la partie est perdue pour Arthur                                        */            //*    . Si Arthur saute sur le dos de Georges, il est "content" car il gagne 3 blasons et   */
    //*      Georges est "applati"                                                               */
    //*    . Si Arthur attaque et atteint Georges de face, il est "content" car il gagne 2       */
    //*      blasons et Georges "vacille".                                                       */
    //*    . Si Arthur attaque et atteint Georges par derrière, il est "content" car il gagne 1  */
    //*      blason et Georges "vacille".                                                        */
    //*    . Si Arthur percute Georges par derrière, il est "vacille" et Georges "attend".       */
    //*                                                                                          */
    //*  Quand il y a collision entre Arthur et Georges, les touches sont désactivées et la      */
    //*  fonction qui pilote Georges est interrompue, le tout jusqu'à la fin du traitement de    */
    //*  la collision.                                                                           */
    //*                                                                                          */
    //*  1) La détection d'une collision est gérée à travers une 'instance' de l'objet Collision.*/
    //*  Elle a des propriétés :                                                                 */
    //*  - flags booléens qui situent Arthur par rapport à Georges                               */
    //*  - qui enregistrent les positions et dimensions de chacun au moment de la collision      */
    //*  - flags booléens du type de collision: avec le mur, Arthur avec Georges...              */
    //*  Elle a des méthodes qui détectent spécifiquement la collision:                          */
    //*  - avec les murs                                                                         */            //*  - entre Arthur et Georges                                                               */
    //*  - et si Arthur saute, la collision avec le dos ou les cornes de Georges                 */
    //*                                                                                          */
    //*  2) Une 'instance' de l'objet ActionsCollision permet:                                     */          
    //*  - de gérer les réactions des personnages suite à une collision: "content", "vacille",   */
    //*    "applati", "ko", "attend"                                                             */
    //*  - d'évaluer et d'enregistrer le score en faisant appel aux méthodes de "scoreJeu" qui   */
    //*    incrémentent le nombre de gamelles ou de blasons retrouvés.                           */       
    //********************************************************************************************/    

    //*==========================================/
    //*       DETECTION DES COLLISIONS           / 
    //*==========================================/

    var Collision = function () {

        this.memeDirection = false;
        this.frontal = false;
        this.arthurDevant = false;
        this.avecMur = false;
        this.avecGeorges = false;
        this.sautSurCornesGeorges = false;
        this.sautSurDosGeorges = false;
        this.arthurData = { x: 0, y: 0, w: 0, h: 0 };
        this.georgesData = { x: 0, y: 0, w: 0, h: 0 };
        this.murData = { x: 0, w: 0 };

        // méthode appelée par les fonctions pilote des déplacements avant d'appeler les méthodes qui détectent les collisions. Elle initialise toutes les propriétés.
        this.initialisation = function () {

            // Arthur se trouve à gauche de Georges
            this.arthurAGauche = $arthurMasque.offset().left < $georgesMasque.offset().left;

            // Arthur et Georges vont dans la même direction
            this.memeDirection = (arthur.direction.droite && georges.direction.droite) ||
                (arthur.direction.gauche && georges.direction.gauche);

            // Arthur et Georges se font face
            this.frontal =
                (arthur.direction.droite && georges.direction.gauche && this.arthurAGauche)
                || (arthur.direction.gauche && georges.direction.droite && !this.arthurAGauche);

            // Arthur et Georges vont dans la même direction et Arthur se trouve devant
            this.arthurDevant = this.memeDirection && ((arthur.direction.gauche && this.arthurAGauche) ||
                (arthur.direction.droite && !this.arthurAGauche));

            // flags de collision
            this.avecMur = false;
            this.avecGeorges = false;
            this.sautSurCornesGeorges = false;
            this.sautSurDosGeorges = false;

            // Données position et dimensions d'Arthur 
            this.arthurData.x = $arthurMasque.offset().left;
            this.arthurData.y = $arthurMasque.offset().top;
            this.arthurData.w = $arthurMasque.width();
            this.arthurData.h = $arthurMasque.height();

            // Données position et dimensions de Georges 
            this.georgesData.x = $georgesMasque.offset().left;
            this.georgesData.y = $georgesMasque.offset().top;
            this.georgesData.w = $georgesMasque.width();
            this.georgesData.h = $georgesMasque.height();

            // Données des murs 
            this.murData.x = $('#scene').offset().left;
            this.murData.w = $('#scene').width();

        };

        // méthode appelée par les fonctions pilote des déplacements pour détecter les collisions avec les murs
        this.checkMurs = function (direction, $masque, marge) {
            this.initialisation();
            var $masqueData = {
                x: $masque.offset().left,
                w: $masque.width(),
            }

            if (($masqueData.x - marge < this.murData.x && direction.gauche) || ($masqueData.x + marge + $masqueData.w > this.murData.x + this.murData.w) && direction.droite) {
                this.avecMur = true;
                return true;
            } else return false;
        };

        // Collision d'Arthur avec les cornes de Georges pendant son saut
        this.checkSautSurCornes = function () {

            // Allez, on s'accorde pour dire que les cornes sont 1/3 de la largeur de Georges
            var georgesDataX = this.georgesData.x,
                georgesDataW = this.georgesData.w / 3;

            // Georges va à droite, 
            if (georges.direction.droite) {
                georgesDataX += this.georgesData.w * 2 / 3;
            }

            if (this.arthurData.x + 20 < georgesDataX + georgesDataW &&
                this.arthurData.x - 20 + this.arthurData.w > georgesDataX &&
                this.arthurData.y + 20 < this.georgesData.y + this.georgesData.h &&
                this.arthurData.h - 20 + this.arthurData.y > this.georgesData.y) {
                this.sautSurCornesGeorges = true;
                this.avecGeorges = true;
                return true;
            }

        };

        // Collision d'Arthur avec le dos de Georges pendant son saut
        this.checkSautSurDos = function () {

            // le dos est sur 2/3 de la largeur de Georges
            var georgesDataX = this.georgesData.x,
                georgesDataW = (this.georgesData.w * 2 / 3);

            if (georges.direction.gauche) {
                georgesDataX += this.georgesData.w / 3;
            }

            if (this.arthurData.x + 20 < georgesDataX + georgesDataW &&
                this.arthurData.x - 30 + this.arthurData.w > georgesDataX &&
                this.arthurData.y + 20 < this.georgesData.y + this.georgesData.h &&
                this.arthurData.h - 20 + this.arthurData.y > this.georgesData.y) {
                this.sautSurDosGeorges = true;
                this.avecGeorges = true;
                return true;
            }

        };

        // méthode appelée par la fonction pilote des déplacements d'Arthur pour détecter les collisions avec Georges
        this.checkCollisionGeorges = function () {

            this.initialisation();

            if (arthur.saute.statut) {
                if (this.checkSautSurCornes()) {
                    return true;
                }
                return this.checkSautSurDos();
            }

            if (this.arthurData.x < this.georgesData.x + this.georgesData.w &&
                this.arthurData.x + this.arthurData.w > this.georgesData.x) {
                this.avecGeorges = true;
                return true;
            }

        }

    };

    //*============================================================/
    //*       GESTION DES REACTIONS SUITE A UNE COLLISION          / 
    //*============================================================/

    var ActionsCollision = function () {

        this.gereConsequences = function () {

            //------------------------------------------------------------/
            //  collision d'Arthur avec un mur => il vacille, +1 gamelle  / 
            //------------------------------------------------------------/

            if (collision.avecMur) {
                initArthurVacille();
                intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                scoreJeu.incrementGamelles();
                return
            }

            //-------------------------------------/
            //   collision d'Arthur avec Georges   /
            //-------------------------------------/

            // On interrompt le pilotage des déplacements de Georges
            clearInterval(intervalIdDeplacementsGeorges);

            // Arthur est en train de sauter
            if (arthur.saute.statut) {
                if (arthur.saute.ascension) {
                    if ((arthur.direction.droite !== georges.direction.droite) && georges.attaque.statut) {
                        initArthurKo();
                        intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                        //georgesAttend(); supprimé car parfois, on ne voit pas bien qu'il a attaqué
                        scoreJeu.rejeuDirect();

                        return;
                    }
                    initArthurVacille();
                    intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                    georgesAttend();
                    scoreJeu.incrementGamelles();

                    return;

                }

                // Arthur est dans la phase descendante de son saut

                //Georges attaque ou n'attaque pas mais Arthur tombe sur son dos
                if (georges.attaque.statut || (!georges.attaque.statut && collision.sautSurDosGeorges)) {
                    initArthurContent();
                    intervalIdArthurAction = setInterval(arthurContent, arthur.content.vitesse);
                    initGeorgesApplati()
                    intervalIdGeorgesAction = setInterval(georgesApplati, georges.applati.vitesse);
                    scoreJeu.incrementBlasons(3);
                    return;
                }
                // Arthur tombe sur les cornes 
                initArthurKo();
                intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                //georgesAttend(); supprimé car parfois, on ne voit pas bien qu'il a attaqué
                scoreJeu.rejeuDirect();
                return;
            }

            // Arthur et Georges se font face, duel à OK Corral...
            if (collision.frontal) {

                // Georges est à l'attaque : Arthur ne peut rien contre les cornes, game over !
                if (georges.attaque.statut) {
                    initArthurKo();
                    intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                    //georgesAttend(); supprimé car parfois, on ne voit pas bien qu'il a attaqué
                    scoreJeu.rejeuDirect();
                    return;
                }

                // Arthur est à l'attaque, Georges court ou attend => Georges vacille, +1 blason
                if (arthur.attaque.statut) {
                    initArthurContent();
                    intervalIdArthurAction = setInterval(arthurContent, arthur.content.vitesse);
                    georgesVacille();
                    scoreJeu.incrementBlasons(2);
                    return;
                }

                // Arthur court et Georges attend ou vice-versa => Arthur vacille, +1 gamelle
                initArthurVacille();
                intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                //georgesAttend(); supprimé car parfois, on ne voit pas bien qu'il a attaqué
                scoreJeu.incrementGamelles();
                return;
            }
            // Arthur et Georges sont dans une même direction et Arthur est devant       
            if (collision.arthurDevant) {

                // Georges est à l'attaque => Arthur est KO, game over !
                if (georges.attaque.statut) {
                    initArthurKo();
                    intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                    //georgesAttend(); supprimé car parfois, on ne voit pas bien qu'il a attaqué
                    scoreJeu.proposeRejeu();
                    return;
                }

                // Arthur vacille et prend une gamelle
                initArthurVacille();
                intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                georgesAttend();
                scoreJeu.incrementGamelles();
                return;
            }

            // Arthur et Georges sont dans une même direction et Arthur est derrière
            if (arthur.attaque.statut) {
                // Arthur est à l'attaque => Georges vacille, +2 blasons
                initArthurContent();
                intervalIdArthurAction = setInterval(arthurContent, arthur.content.vitesse);
                georgesVacille();
                scoreJeu.incrementBlasons(1);
                return;
            }
            // Arthur n'attaque pas => il vacille, +1 gamelle
            initArthurVacille();
            intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
            georgesAttend();
            scoreJeu.incrementGamelles();
            return;

        };

    }

    //*******************************************************************************************************/
    //*                            GESTION DES ACTIONS/DEPLACEMENT DES PERSONNAGES                          */
    //*=====================================================================================================*/
    //*  Arthur et Georges ont un fonctionnement similaire. L'exécution d'un pas pour l'un et l'autre est   */
    //*  identique. C'est géré à travers l'objet "unMouvementSprite". Il suffira d'invoquer la méthode      */
    //*  "action" en passant le nom de l'action (ex: "court") pour un personnage et son masque.             */ 
    //*                                                                                                     */
    //*  Pour les déplacements pas à pas, la méthode est invoquée directement par la fonction pilote des    */
    //*  déplacements. C'est le cas des actions "court" d'Arthur et "court" et "attaque" de Georges         */
    //*                                                                                                     */
    //*  Les actions à dérouler complètement avec ou sans rebouclage nécessitent d'appeler de façon répétée */
    //*  l'exécution d'un pas. Elles font l'objet d'une fonction spécifique à l'action et au personnage.    */
    //*  Elles sont appelées par les fonctions pilote (ex. Arthur "attend", "attaque" et "saute") ou par    */
    //*  les méthodes de l'instance ActionsCollision (ex. Arthur "vacille", "content" et "ko", Georges      */
    //*  "attend", "vacille" et "applati".                                                                  */
    //*******************************************************************************************************/

    //*=====================================================================================================*/
    //*                           EXECUTION D'UN PAS DE DEPLACEMENT                                         */
    //*-----------------------------------------------------------------------------------------------------*/
    //  La variable "unMouvementSprite" permet de gérer un pas de déplacement d'Arthur et de Georges.       */
    //  Elle référence un objet dont les propriétés et méthodes permettent:                                 */
    //  - de cibler dans la table des sprites celui à afficher selon l'action en cours                      */
    //  - d'ajuster la taille du masque                                                                     */
    //  - de déplacer le masque.                                                                            */
    //                                                                                                      */
    //  Sa méthode 'action' est le moteur du déplacement. C'est elle qui est invoquée pour que le           */ 
    //  personnage effectue un 'pas':                                                                       */
    //  - elle récupère l'objet personnage, l'image du sprite, le nom de l'action en cours et l'indice du   */
    //    sprite dans la table des sprites l'action en cours du personnage.                                 */
    //  - elle lance les méthodes qui permettent d'effectuer le pas.                                        */
    //*=====================================================================================================*/

    var unMouvementSprite = {
        nomAction: null,
        persoAction: null,
        sensDeplacement: null,
        orientation: null,
        $masque: null,
        $image: null,

        determinerSens: function (personnage) {
            this.sensDeplacement = personnage.direction.droite ? 1 : -1;
            this.orientation = personnage.orientation;
        },

        accederImageSprite: function (indice) {
            this.$image.css({
                top: this.persoAction.sprites[indice].top,
                left: this.persoAction.sprites[indice].left
            });
        },

        deplacerMasque: function (indice) {

            // calcul du déplacement left du masque d'Arthur
            var deplacementLeft = parseFloat(this.$masque.css('left')) + (this.persoAction.pas * this.sensDeplacement);

            // on applique au masque les déplacements calculés et les dimensions du sprite du personnage en cours; l'image est affichée selon les orientation et direction du personnage
            this.$masque.width(this.persoAction.sprites[indice].width).height(this.persoAction.sprites[indice].height).css({
                transform: 'scaleX(' + (this.sensDeplacement * this.orientation) + ')',
                left: deplacementLeft
            });

        },

        // Même principe que pour la fonction "deplacerMasque" mais le déplacement en (left, bottom) est calculé pour un saut en demi-cercle
        deplacerMasqueSaut: function (indice) {

            // calcul du déplacement en (left, bottom) du masque d'Arthur
            var deplacementLeft = this.persoAction.x0 + (this.persoAction.rayon * Math.cos(this.persoAction.angle0));

            var deplacementBottom = this.persoAction.y0 - (this.persoAction.rayon * Math.sin(this.persoAction.angle0));

            // on applique au masque les déplacements calculés et les dimensions du sprite d'Arthur en cours; l'image est affichage selon l'orientation et direction d'Arthur
            this.$masque.width(this.persoAction.sprites[indice].width).height(this.persoAction.sprites[indice].height).css({
                transform: 'scaleX(' + (this.sensDeplacement * this.orientation) + ')',
                left: deplacementLeft, bottom: deplacementBottom
            });

            // incrément du radian pour la prochaine position
            this.persoAction.angle0 += this.persoAction.pas * this.sensDeplacement;
        },

        // cette méthode pilote les methodes à invoquer pour le déplacement
        action: function (personnage, idImage, nomAction, indice) {

            this.nomAction = nomAction;
            this.persoAction = personnage[nomAction];
            this.$masque = $(idImage + 'Masque');
            this.$image = $(idImage);
            this.determinerSens(personnage);
            this.accederImageSprite(indice);
            if (nomAction === 'saute') {
                this.deplacerMasqueSaut(indice);
            } else {
                this.deplacerMasque(indice);
            }
        }

    };

    //*===================================*/
    //*      LES ACTIONS D'ARTHUR         */
    //*===================================*/

    // indices de la table des sprites de chaque action 
    var indiceArthur = {
        attend: 0,
        content: 0,
        court: 0,
        saute: 0,
        attaque: 0,
        vacille: 0,
        ko: 0
    };

    var initIndicesArthur = function () {
        indiceArthur.attaque = 0;
        indiceArthur.attend = 0;
        indiceArthur.content = 0;
        indiceArthur.court = 0;
        indiceArthur.ko = 0;
        indiceArthur.saute = 0;
    }

    //-----------------------------------------------------------------------------------------------------/
    //  Fonction générique appelée pour l'exécution d'un pas pour une action donnée.                       /
    //  Elle gère l'indice de la table des sprites de l'action et appelle la méthode "action" de l'objet   /
    //  "unMouvementSprite" en passant le personnage et le masque d'Arthur, le nom de l'action et l'indice /
    //  du sprite en cours.                                                                                /
    //-----------------------------------------------------------------------------------------------------/

    var arthurAction = function (nomAction) {
        //quand on arrive au dernier sprite de l'action on reboucle sur le 1er 
        if (!arthur[nomAction].sprites[indiceArthur[nomAction]]) {
            indiceArthur[nomAction] = 0;
        }

        //Si c'est une nouvelle action on met à jour les propriétés actionPrecedente et le statut correspondant 
        if (nomAction !== arthur.actionPrecedente) {
            indiceArthur[arthur.actionPrecedente] = 0;
            arthur.actionPrecedente = nomAction;
            arthur[arthur.actionPrecedente].statut = false;
            arthur[nomAction].statut = true;
        }

        //Le personnage d'Arthur effectue un pas de déplacement
        unMouvementSprite.action(arthur, '#arthur', nomAction, indiceArthur[nomAction]);
        indiceArthur[nomAction]++;
    };

    // fonction pour désactiver les touches de déplacement d'Arthur, interrompre les actions déroulées par un setInterval et réinitialiser le statut de toutes les actions du personnage d'Arthur. Elle est appelée lorsqu'Arthur attaque et saute et quand une collision est détectée.
    var desactivations = function () {
        clavier.actif = false;
        clavier.reinitTouches();
        clearInterval(intervalIdArthurAction);
        arthur.initStatuts();
    };

    //---------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution d'une attaque  : une fonction d'initialisation et la   /
    //  fonction d'attaque proprement dite.                                                        /
    //---------------------------------------------------------------------------------------------/

    var decompteAttaque = null;
    var initArthurAttaque = function () {
        desactivations();
        decompteAttaque = arthur.attaque.nbBoucles;
        arthur.attaque.statut = true;
    }

    // Fonction appelée avec un setInterval. Elle appelle la fonction "arthurAction" avec l'argument "attaque" et inclut la détection des collisions avec les murs et Georges.
    var arthurAttaque = function () {

        if (decompteAttaque <= 0) {
            clavier.actif = true;
            clavier.touches.keyup = true
            clearInterval(intervalIdArthurAction);
            decompteAttaque = arthur.attaque.nbBoucles;
            arthur.attaque.statut = false;
            indiceArthur.attaque = 0;

            return;
        }

        arthurAction('attaque');

        // test de la collision avec les murs
        if (collision.checkMurs(arthur.direction, $arthurMasque, 20)) {
            clearInterval(intervalIdArthurAction);
            actionsCollision.gereConsequences();
            return;
        }

        // test de la collision avec Georges
        if (collision.checkCollisionGeorges()) {
            clearInterval(intervalIdArthurAction);
            collision.avecGeorges = true;
            actionsCollision.gereConsequences();
            return;
        }

        decompteAttaque--;

    };

    //--------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution de l'attente : une fonction d'initialisation et la    /
    //  fonction d'attente proprement dite.                                                       /
    //--------------------------------------------------------------------------------------------/

    var initArthurAttend = function () {
        clearInterval(intervalIdArthurAction);
        arthur.initStatuts();
        arthur.attend.statut = true;
    };

    // Variable rustine pour résoudre un bogue : il arrive que 2 actions de mise en attente d'Arthur soient en cours même temps. Je n'ai pas trouvé comment ce cas arrive
    var actionArthurAttend = false;

    // Fonction appelée avec un setInterval. Elle appelle la fonction "arthurAction" avec l'argument "attend" et inclut la détection des collisions avec les murs et Georges.
    var arthurAttend = function () {

        // L'appui sur une touche d'action ou la désactivation du clavier met fin à l'attente d'Arthur
        if (clavier.uneToucheAppuyee() || !clavier.actif) {
            clearInterval(intervalIdArthurAction);
            actionArthurAttend = false;
            arthur.attend.statut = false;
            indiceArthur.attend = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300);
            return;
        }

        // test de la collision avec Georges
        if (collision.checkCollisionGeorges()) {
            clearInterval(intervalIdArthurAction);
            collision.avecGeorges = true;
            actionsCollision.gereConsequences();
            return;
        }

        arthurAction('attend');
    };

    //-----------------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution de l'action "content" après une attaque réussie: une fonction  /
    //  d'initialisation et la fonction "arthurContent" proprement dite.                                   /
    //-----------------------------------------------------------------------------------------------------/

    var decompteContent = null;
    var initArthurContent = function () {
        desactivations();
        decompteContent = arthur.content.nbBoucles;
        arthur.content.statut = true;
        $arthurMasque.animate({ bottom: bottomArthurMasque }, 700)
    }

    // Fonction appelée avec un setInterval. Elle appelle la fonction "arthurAction" avec l'argument "content" et inclut le repositionnement des personnages pour la reprise du jeu.
    var arthurContent = function () {

        if (decompteContent <= 0) {
            clearInterval(intervalIdArthurAction);
            arthur.content.statut = false;

            indiceArthur.content = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300);

            scoreJeu.repositionPersonnages();

            return;
        }
        arthurAction('content');
        decompteContent--;
    };

    //-----------------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution de l'action "ko" après avoir été encorné : une fonction        / 
    //  d'initialisation et la fonction KO proprement dite.                                                /
    //-----------------------------------------------------------------------------------------------------/

    var initArthurKo = function () {
        desactivations();
        arthur.ko.statut = true;
    };

    var arthurKo = function () {

        if (!arthur.ko.sprites[indiceArthur.ko]) {
            clearInterval(intervalIdArthurAction);
            indiceArthur.ko = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300)
            return;
        }

        arthurAction('ko');
    };

    //--------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution d'un saut : une fonction d'initialisation qui calcule /   
    //  les éléments permettant la nouvelle position du masque d'Arthur à chaque 'pas'; et la     /
    //  fonction de saut proprement dite.                                                         /
    //--------------------------------------------------------------------------------------------/

    // calcul des coordonnées des positions successives d'Arthur pendant le saut
    var initArthurSaute = function () {
        // désactivation du clavier pendant le saut
        desactivations();
        arthur.saute.statut = true;
        arthur.saute.ascension = true;
        arthur.saute.descente = false;
        // Le saut décrit un 1/2 cercle à partir d'un centre (x0,y0) à déterminer. Les rayon et radian sont des propriétés du saut d'Arthur.
        arthur.saute.y0 = parseFloat($arthurMasque.css('bottom'));
        if (arthur.direction.droite) {
            arthur.saute.x0 = parseFloat($arthurMasque.css('left')) + arthur.saute.rayon;
            arthur.saute.angle0 = Math.PI;
        } else {
            arthur.saute.x0 = parseFloat($arthurMasque.css('left')) - arthur.saute.rayon;
            arthur.saute.angle0 = 2 * Math.PI;
        }
    }

    // Fonction appelée avec un setInterval. Elle appelle la fonction "arthurAction" avec l'argument "saute" et inclut la détection des collisions avec les murs et Georges.
    var arthurSaute = function () {

        // On est sur le dernier sprite pour le saut
        if (!arthur.saute.sprites[indiceArthur.saute]) {
            clearInterval(intervalIdArthurAction);
            indiceArthur.saute = 0;
            //  Réactivation du clavier après le saut, Arthur se met automatiquement en attente avec le flag keyup à 'true'
            clavier.actif = true;
            clavier.touches.keyup = true;
            return;
        }

        arthurAction('saute');

        if (arthur.direction.droite) {
            if (arthur.saute.angle0 >= arthur.saute.angleFinAscension) {
                arthur.saute.ascension = false;
                arthur.saute.descente = true;
            }
        } else {
            if (arthur.saute.angle0 <= arthur.saute.angleFinAscension) {
                arthur.saute.ascension = false;
                arthur.saute.descente = true;
            }
        }

        // test de la collision avec les murs
        if (collision.checkMurs(arthur.direction, $arthurMasque, 20)) {
            clearInterval(intervalIdArthurAction);
            actionsCollision.gereConsequences();
            return;
        }

        // test de la collision avec Georges
        if (collision.checkCollisionGeorges()) {
            clearInterval(intervalIdArthurAction);
            collision.avecGeorges = true;
            actionsCollision.gereConsequences();
            return;
        }

    };

    //--------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution d'un vacillement suite à une collision avec un mur    /
    //  après avoir percuté Georges : une fonction d'initialisation et la fonction de vacillement /
    //  proprement dite.                                                                          /
    //--------------------------------------------------------------------------------------------/

    var decompteVacille = null;
    var initArthurVacille = function () {
        desactivations();
        decompteVacille = arthur.vacille.nbBoucles;
        arthur.vacille.statut = true;
    };

    // Fonction appelée avec un setInterval. Elle appelle la fonction "arthurAction" avec l'argument "vacille" et inclut le repositionnement des personnages pour la reprise du jeu.
    var arthurVacille = function () {

        if (decompteVacille <= 0) {
            clearInterval(intervalIdArthurAction);
            arthur.vacille.statut = false;

            indiceArthur.vacille = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300);
            scoreJeu.repositionPersonnages();

            return;
        }
        arthurAction('vacille');
        decompteVacille--;
    };

    //*=====================================================================================================*/
    //*                         GESTION DES EVENEMENTS DE TOUCHES                                           */
    //*-----------------------------------------------------------------------------------------------------*/
    //*  Arthur se déplace en fonction de l'appui des touches directionnelles et la barre espace.           */
    //*                                                                                                     */
    //*  Les écouteurs d'événement "keydown" et "keyup" sont mis en place pour détecter l'appui de ces      */
    //*  touches.                                                                                           */
    //*                                                                                                     */
    //*  La variable "clavier" référence un objet dont les propriétés et méthodes permettent :              */
    //*  - de gérer un flag booléen attachée à chaque touche de déplacement pour savoir si elle est appuyée */
    //*    ou non                                                                                           */ 
    //*  - de savoir si une touche de déplacement quelconque est appuyée                                    */
    //*  - d'activer ou désactiver le clavier, càd de prendre en compte ou non l'appui sur une touche de    */
    //*    déplacement.                                                                                     */
    //*=====================================================================================================*/

    var clavier = {
        actif: false,
        touches: {
            gauche: false,
            haut: false,
            droite: false,
            entree: false,
            espace: false,
            keyup: false
        },
        reinitTouches: function () {
            this.touches.gauche = false;
            this.touches.droite = false;
            this.touches.haut = false;
            this.touches.entree = false;
            this.touches.espace = false;
            this.touches.keyup = false;
        },
        uneToucheAppuyee: function () {
            return this.touches.gauche ||
                this.touches.droite ||
                this.touches.haut ||
                this.touches.entree ||
                this.touches.espace;
        }
    };

    $(window).keydown(function (e) {

        if (clavier.actif) {
            clavier.touches.keyup = false;
            switch (e.which) {

                case 32:
                    clavier.touches.espace = true;
                    break;
                case 37:
                    clavier.touches.gauche = true;
                    break;
                case 38:
                    clavier.touches.haut = true;
                    break;
                case 39:
                    clavier.touches.droite = true;
                    break;
            };
        }
    });

    $(window).keyup(function () {
        clavier.touches.keyup = true;
    });

    //*=================================================================================================*/
    //*               PILOTAGE DES DEPLACEMENTS D'ARTHUR                                                */
    //*-------------------------------------------------------------------------------------------------*/
    //*  Un flag booléen est associé à chacune des touches de déplacement d'Arthur : true si appuyée,   */ 
    //*  false sinon. Un flag est également défini pour gérer le fait qu'aucune touche est appuyée.     */
    //*                                                                                                 */  
    //*  La variable "piloteDeplacementsArthur" référence la fonction qui pilote les opérations pour    */ 
    //*  - analyser les flags des touches et décider de l'action à engager                              */
    //*  - invoquer la fonction "arthurAction" avec en argument le nom d'une action 'pas à pas'         */
    //*  - invoquer les méthodes de détection de collision pour une action 'pas à pas'                  */
    //*  - invoquer les méthodes de gestion des conséquences suite à détection d'une collision          */
    //*  - invoquer avec un setInterval les fonctions des actions à dérouler complètement               */
    //*                                                                                                 */
    //*  C'est une fonction qui se répète avec un requestAnimationFrame.                                */
    //*                                                                                                 */
    //*  Le recours aux flags pour les touches et au requestAnimationFrame pour la gestion des touches  */
    //*  évite le délai de réaction constaté au 1er appui d'une touche donnée.                           */
    //*=================================================================================================*/

    var piloteDeplacementsArthur = function () {

        // Arthur veut aller à gauche, initialisation de sa direction        
        if (clavier.touches.gauche) {
            arthur.initDirection(false, true)
        }

        // Arthur veut aller à gauche, initialisation de sa direction
        if (clavier.touches.droite) {
            arthur.initDirection(true, false)
        }

        // qq soit la direction, test des collisions avec les murs et avec Georges
        if ((clavier.touches.gauche) || (clavier.touches.droite)) {

            arthur.initStatuts();
            arthur.court.statut = true;
            arthurAction('court');

            // test de la collision avec les murs
            if (collision.checkMurs(arthur.direction, $arthurMasque, 20)) {
                actionsCollision.gereConsequences();
            } else {// tests collisison avec georges
                collision.initialisation();
                if (collision.checkCollisionGeorges()) {
                    collision.avecGeorges = true;
                    actionsCollision.gereConsequences();
                }
            }

        }

        // Arthur veut sauter
        if (clavier.touches.haut) {
            // Exécution du saut complet (jump + fall)
            initArthurSaute();
            arthur.initStatuts();
            arthur.saute.statut = true;
            intervalIdArthurAction = setInterval(arthurSaute, arthur.saute.vitesse);
        }

        // Arthur veut attaquer
        if (clavier.touches.espace) {
            // Exécution d'une attaque complète
            initArthurAttaque();
            arthur.initStatuts();
            arthur.attaque.statut = true;
            intervalIdArthurAction = setInterval(arthurAttaque, arthur.attaque.vitesse);
        }

        // A flag keyup à true càd aucune touche de déplacement n'est appuyée
        if (clavier.touches.keyup) {

            // Le clavier est actif, Arthur est mis en attente
            if (clavier.actif) {
                clavier.reinitTouches();
                if (actionArthurAttend) {
                    clearInterval(intervalIdArthurAction);
                    actionArthurAttend = false;
                }
                initArthurAttend();
                intervalIdArthurAction = setInterval(function () {
                    actionArthurAttend = true;
                    arthurAttend();
                }, arthur.attend.vitesse);

            }
        }

        requestAnimationFrame(piloteDeplacementsArthur);

    };

    //*===================================*/
    //*      LES ACTIONS DE GEORGES       */
    //*===================================*/

    // indices de la table des sprites de chaque action 
    var indiceGeorges = {
        attend: 0,
        court: 0,
        saute: 0,
        attaque: 0,
        vacille: 0,
        ko: 0
    };
    var initIndicesGeorges = function () {
        indiceGeorges.applati = 0;
        indiceGeorges.attaque = 0;
        indiceGeorges.attend = 0;
        indiceGeorges.court = 0;
        indiceGeorges.vacille = 0;
    }

    //-------------------------------------------------------------------------------------------------------/
    //  Fonction générique appelée pour l'exécution d'un pas pour une action donnée.                         /
    //  Elle gère l'indice de la table des sprites de l'action et appelle la méthode "action" de l'objet     /
    //  "unMouvementSprite" en passant le personnage et le masque de Georges, le nom de l'action et l'indice /
    //  du sprite en cours.                                                                                  /
    //-------------------------------------------------------------------------------------------------------/

    var georgesAction = function (nomAction) {
        //quand on arrive au dernier sprite de l'action on reboucle sur le 1er 
        if (!georges[nomAction].sprites[indiceGeorges[nomAction]]) {
            indiceGeorges[nomAction] = 0;
        }

        //Si c'est une nouvelle action on met à jour les propriétés actionPrecedente et le statut correspondant 
        if (nomAction !== georges.actionPrecedente) {
            indiceGeorges[georges.actionPrecedente] = 0;
            georges[georges.actionPrecedente].statut = false;
            georges.actionPrecedente = nomAction;
            georges[nomAction].statut = true;

        }

        //Le personnage de georges effectue un pas de déplacement
        unMouvementSprite.action(georges, '#georges', nomAction, indiceGeorges[nomAction]);
        indiceGeorges[nomAction]++;
    }

    //-----------------------------------------------------------------------------------------------------/
    //  Fonctions appelées pour l'éxécution de l'action "applati" suite à une collision avec Arthur : une  / 
    //  fonction d'initialisation et la fonction d'applatissement (?) proprement dite.                     /
    //-----------------------------------------------------------------------------------------------------/
    var initGeorgesApplati = function () {
        georges.applati.statut = true;
    };

    // Fonction appelée avec un setInterval. Elle appelle la fonction "georgesAction" avec l'argument "applati".
    var georgesApplati = function () {
        if (!georges.applati.sprites[indiceGeorges.applati]) {
            clearInterval(intervalIdGeorgesAction);
            indiceGeorges.applati = 0;
            return;
        }
        georgesAction('applati');
    };

    //--------------------------------------------------------------------------------------------------/
    //  Fonction appelée pour l'éxécution de l'attente suite à une collision avec Arthur.               /
    //  Appelée avec un setInterval, elle appelle la fonction "georgesAction" avec l'argument "attend". / 
    //--------------------------------------------------------------------------------------------------/

    var georgesAttend = function () {
        clearInterval(intervalIdGeorgesAction);
        georges.initStatuts();
        georges.attend.statut = true;
        intervalIdGeorgesAction = setInterval(function () {
            georgesAction('attend')
        }, georges.attend.vitesse);
    };

    //--------------------------------------------------------------------------------------------------/
    //  Fonction appelée pour l'éxécution du vacillement suite à une collision avec Arthur.             /
    //  Appelée avec un setInterval, elle appelle la fonction "georgesAction" avec l'argument "vacille"./ 
    //--------------------------------------------------------------------------------------------------/
    var georgesVacille = function () {
        clearInterval(intervalIdGeorgesAction);
        georges.initStatuts();
        georges.vacille.statut = true;
        intervalIdGeorgesAction = setInterval(function () {
            georgesAction('vacille')
        }, georges.vacille.vitesse);
    };

    //*=================================================================================================*/
    //*               PILOTAGE DES DEPLACEMENTS DE GEORGES                                              */
    //*-------------------------------------------------------------------------------------------------*/ 
    //*  La variable "piloteDeplacementsGeorges" référence la fonction qui pilote les opérations pour   */
    //*  les actions 'pas à pas' telles que "court" et attaque" :                                       */
    //*  - invoquer la fonction "georgesAction" avec en argument le nom de l'action                     */
    //*  - invoquer les méthodes de détection de collision avec les murs                                */
    //*  - invoquer les méthodes de gestion des conséquences suite à détection d'une collision avec un  */     //*    un mur                                                                                       */
    //*                                                                                                 */
    //*  Lorsque le jeu démarre ou reprend après une collision, Georges court dans la direction         */
    //*  d'initialisation. Son comportement change dans les cas suivant :                               */
    //*                                                                                                 */
    //*  1) Si Georges n'est pas face à Arthur, il fait demi-tour mais ce n'est pas systématique. Un    */
    //*   booléen "flagDemiTour" initialisé à false et mis à jour périodiquement avec sa valeur         */
    //*   contraire. Le demi-tour n'est exécuté qui si ce flag est 'true'.                              */
    //*                                                                                                 */
    //*  2) Si Arthur est face à lui et est à sa portée (on définit une distance limite d'attaque),     */
    //*  Georges attaque mais ce n'est pas systématique. La décision d'attaquer ou de ne pas attaquer   */
    //*  est décidé aléatoirement et est valide pendant 2s. C'est géré avec une instance de l'objet     */
    //*  DecisionAttaque.                                                                               */
    //*                                                                                                 */
    //*  La fonction pilote est appelée avec un setInterval au démarrage du jeu. La propriété "vitesse" */
    //*  du personnage contient le délai de répétition.                                                 */
    //*  La répétition est interrompue quand une collision avec Arthur est détectée ou quand le jeu est */
    //*  terminé (perdu ou gagné). Elle reprend après le traitement de la collision ou quand on rejoue. */
    //*=================================================================================================*/

    var piloteDeplacementsGeorges = function () {
        clearInterval(intervalIdGeorgesAction);

        //--------------------------------------------------------------------------------------------/
        //  Les variables suivantes permettent de déterminer les conditions pour un demi-tour et une  /
        //  attaque.                                                                                  /
        //--------------------------------------------------------------------------------------------/

        var georgesAGauche = $georgesMasque.offset().left < $arthurMasque.offset().left;

        var arthurX, georgesX;
        if (georgesAGauche) {
            arthurX = $arthurMasque.offset().left;
            georgesX = $georgesMasque.offset().left + $georgesMasque.width();
        } else {
            arthurX = $arthurMasque.offset().left + $arthurMasque.width();
            georgesX = $georgesMasque.offset().left;
        }

        // Variable de la condition dans laquelle Georges peut faire 1/2 tour pour faire face à Arthur
        var conditionDemiTour = (georges.direction.gauche
            && georgesAGauche) || (georges.direction.droite
                && arthur.direction.gauche
                && !georgesAGauche);

        // Variable de la condition dans laquelle Georges peut attaquer
        var conditionAttaque = Math.abs(georgesX - arthurX) < distanceLimiteAttaque &&
            !conditionDemiTour;

        // Georges ne fait un demi-tour que si Arthur n'est pas en train de sauter (sinon c'est chaud pour Arthur!) et que le flag demi-tour est à true
        if (conditionDemiTour && !arthur.saute.statut && flagDemiTour) {
            georges.direction.droite = !georges.direction.droite;
            georges.direction.gauche = !georges.direction.gauche;
        }

        // Georges peut attaquer si Arthur est à sa portée
        if (conditionAttaque) {

            // instanciation d'un objet décisionAttaque
            if (!decisionAttaque) {
                decisionAttaque = new DecisionAttaque();
                // Une fonction décide aléatoirement d'une attaque ou non
                if (decisionAttaque.aleatoire()) {
                    georges.initStatuts();
                    georges.attaque.statut = true;
                    georgesAction('attaque');
                    return;
                }
            }

            // La décision d'attaquer est prise
            if (decisionAttaque.attaqueOk) {

                // Si décision prise moins de 2 secondes avant, Georges attaque
                if (Date.now() - decisionAttaque.dateAttaqueOk < 2000) {
                    georges.initStatuts();
                    georges.attaque.statut = true;
                    georgesAction('attaque');
                    return;
                }

                // Si décision prise plus de 2 secondes avant, Georges reprend sa course
                georges.initStatuts();
                georges.court.statut = true;
                georgesAction('court');

                decisionAttaque = null;

                // Test Collision avec les murs 
                if (collision.checkMurs(georges.direction, $georgesMasque, 10)) {
                    //Georges fait demi-tour
                    georges.direction.droite = !georges.direction.droite;
                    georges.direction.gauche = !georges.direction.gauche;
                }
                return;
            }

            // il est décidé de ne pas attaquer
            if (decisionAttaque.attaqueKo) {

                // Si décision prise moins de 2 secondes avant, Georges reste en course                
                if (Date.now() - decisionAttaque.dateAttaqueKo < 2000) {
                    georges.initStatuts();
                    georges.court.statut = true;
                    georgesAction('court');
                    // Test Collision avec les murs  
                    if (collision.checkMurs(georges.direction, $georgesMasque, 10)) {
                        //Georges fait demi-tour
                        georges.direction.droite = !georges.direction.droite;
                        georges.direction.gauche = !georges.direction.gauche;
                    }
                    return;
                }

                decisionAttaque = null;
            }

        } else
        // Arthur est hors de portée d'attaque, Georges court...        
        {
            georges.initStatuts();
            georges.court.statut = true;
            georgesAction('court');
            // Test collision avec les murs 
            if (collision.checkMurs(georges.direction, $georgesMasque, 10)) {
                //Georges fait demi-tour
                georges.direction.droite = !georges.direction.droite;
                georges.direction.gauche = !georges.direction.gauche;
            }

        }

    }

    //*******************************************************************/
    //*          DEMARRAGE DE L'APPLICATION ET DU JEU                   */
    //*******************************************************************/
    
    //---------------------------------------------------------------------------------------/ 
    //      Variables pour le positionnement des personnages                                 /
    //---------------------------------------------------------------------------------------/
    // Le jeu demarre :                                                                      / 
    // - les personnages ont une position initiale                                           / 
    //                                                                                       /
    // Après le traitement d'une collision détectée et que la partie n'est pas terminée      / 
    // - les personnages sont repositionnés aléatoirement (fonctions "nbAleatoire" et        /
    //   calculPositions)                                                                    /
    // - le clavier est réactivé                                                             /
    //                                                                                       /
    // La partie est terminée :                                                              /
    // - les personnages sont repositionnés avec une fonction aléatoire                      /
    // - le clavier doit être désactivé, il sera réactivé si choix de rejouer                /
    //---------------------------------------------------------------------------------------/

    var flagPositionAleatoire = false; // positionné à true quand la 1ère partie est démarré

    var nbAleatoire = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var calculPositions = function () {
        var positions = {
            arthur: 0,
            georges: 0
        }

        if (nbAleatoire(0, 1)) {
            positions.arthur = nbAleatoire(6, 8) * 10;
            positions.georges = nbAleatoire(2, 4) * 10;
        } else {
            positions.georges = nbAleatoire(6, 8) * 10;
            positions.arthur = nbAleatoire(2, 4) * 10;
        }
        return positions;
    }

    //----------------------------------------------------/
    //      Variables pour la gestion des collisions      /
    //----------------------------------------------------/

    var collision = new Collision();
    var actionsCollision = new ActionsCollision();

    var $blasonsMasque = $('#blasonsMasque');

    //----------------------------------------------------/
    //      Variables pour la gestion d'Arthur            /
    //----------------------------------------------------/
    var arthur = new ArthurPersonnage();
    var $arthurMasque = $('#arthurMasque');
    var bottomArthurMasque = $arthurMasque.css('bottom');
    var intervalIdArthurAction = null;

    //----------------------------------------------------/
    //      Variables pour la gestion de Georges          /
    //----------------------------------------------------/
    var $georgesMasque = $('#georgesMasque');
    var georges = new GeorgesPersonnage();
    var intervalIdGeorgesAction = null;
    var intervalIdDeplacementsGeorges = null;

    var flagDemiTour = false;
    setInterval(function () {
        flagDemiTour = !flagDemiTour;
    }, 2000);

    var distanceLimiteAttaque = 85;

    var DecisionAttaque = function () {
        this.attaqueOk = false;
        this.attaqueKo = false;
        this.dateAttaqueOk = 0;
        this.dateAttaqueKo = 0;
        this.aleatoire = function () {
            if (Math.round(Math.random())) {
                this.dateAttaqueOk = Date.now();
                this.attaqueOk = true;
                return true;
            } else {
                this.dateAttaqueKo = Date.now();
                this.attaqueKo = true;
                return false;
            }
        }

    };
    var decisionAttaque = null;

    //-------------------------------------------------------------------/
    //  Ajustement des affichages à la hauteur de la fenêtre de l'écran  / 
    //-------------------------------------------------------------------/

    var hauteur = $(window).height();

    $('#accueil').height(hauteur - hauteur * 17 / 100);
    $('#jeu').height(hauteur - hauteur * 19 / 100);
    $('#scene').height(hauteur - hauteur * 40 / 100);
    $('#iframeCv').height(hauteur - hauteur * 18 / 100);

    //*=====================================================================================================*/
    //*                  GESTION DES EVENEMENTS AU DEMARRAGE D'UNE PARTIE DE JEU                            */
    //*-----------------------------------------------------------------------------------------------------*/
    //*  Trois écouteurs sont attachés aux clics des boutons "jouer", "baston", "baston again".             */
    //*                                                                                                     */ 
    //*  "jouer" dans la page d'accueil:                                                                    */
    //*  - on affiche la page de jeu avec les règles et le bouton "baston".                                 */
    //*                                                                                                     */ 
    //*  "baston" dans la page de jeu avec les règles:                                                      */
    //*  - les règles disparaissent et on affiche les personnages, le score et les blasons retrouvés        */
    //*  - quand la partie prend fin, la page de rejeu se superpose en opacité: elle affiche le résultat,   */
    //*    perte ou gain, et le bouton "baston again" pour rejouer.                                         */
    //*                                                                                                     */
    //*  "baston again" dans la page de rejeu:                                                              */
    //*  - la page de rejeu disparait et une nouvelle partie démarre.                                       */
    //*=====================================================================================================*/

    // mise en mouvement des personnages  
    var miseEnMouvementPersonnages = function () {

        // Arthur
        arthur.actionPrecedente = 'attend';
        initArthurAttend();
        intervalIdArthurAction = setInterval(arthurAttend, arthur.attend.vitesse);

        // Georges
        georges.actionPrecedente = 'attend';
        georgesAttend();
    }

    // Calcul aléatoire des positions de départ des personnages quand on rejoue
    var initPositionPersonnages = function () {

        var positionArthur, positionGeorges;

        if (flagPositionAleatoire) {
            var positions = calculPositions();
            positionArthur = positions.arthur + '%';
            positionGeorges = positions.georges + '%';
        } else {
            positionArthur = 20 + '%';
            positionGeorges = 80 + '%';
        }

        flagPositionAleatoire = true;

        // Arthur
        //---------
        arthur.initDirection(true, false);
        initIndicesArthur();
        $arthurMasque.css({ left: positionArthur }, { bottom: '50px' });

        // Georges
        //----------
        clearInterval(intervalIdDeplacementsGeorges);
        georges.initDirection(false, true);
        initIndicesGeorges();
        $georgesMasque.css({ left: positionGeorges });

        // Mise en mouvement des personnages
        miseEnMouvementPersonnages();

    }

    // initialisation des propriétés des variables objet
    var initialisationVariables = function () {

        scoreJeu.initialisation();
        scoreJeu.afficheScore();
        $blasonsMasque.width(0);
        flagPositionAleatoire = false;

        clavier.actif = true;
        clavier.touches.keyup = true;

    }

    // Fonction pour cacher les règles du jeu et la page de rejeu et afficher/réafficher les éléments et protagonistes du jeu  
    var initStylePageJeu = function () {
        $('#rdj').css('display', 'none');
        $('#jouer').css('display', 'block');
        $('#rejouer').css('display', 'none');
    }

    // Fonction d'affichage de la page de rejeu
    var afficherPageRejeu = function () {
        $('#rejouer').css('display', 'flex').height($('#scene').height()).width($('#scene').width());
    }

    //------------------------------------------------------------/
    //  Evénement clic sur bouton "jouer" de la page d'accueil    / 
    //------------------------------------------------------------/ 

    $('#btnJouer').click(function () {

        // La page d'accueil disparaît, affichage de la page de jeu
        $('#accueil').css('display', 'none');
        $('#jeu').css('display', 'block');

        var $jouer = $('#jouer');
        var $jouerPos = $jouer.offset();

        // Calage de la page de rejeu à l'espace de jeu à laquelle elles se superpose
        $('#rejouer').css({ top: $jouerPos.top, left: $jouerPos.left }).width($jouer.innerWidth());

        // Apparition des liens vers l'accueil et vers le CV
        $('#imgAccueil').animate({ top: '-15px' }, 1700);
        $('#imgMonCv').animate({ top: '0px' }, 2500);

    });

    //----------------------------------------------------------------------/
    //  Evénement clic sur bouton "baston" de la page de jeu/règle du jeu   / 
    //----------------------------------------------------------------------/ 

    $('#btnBaston').click(function () {

        scoreJeu.son.jouer.play();

        initialisationVariables();

        // Cacher les règles du jeu et afficher les éléments et protagonistes du jeu
        initStylePageJeu();

        //  Positionnement et mise en mouvement des personnages
        initPositionPersonnages();

        // démarrer la gestion des touches de déplacement d'Arthur     
        piloteDeplacementsArthur();

        clearInterval(intervalIdGeorgesAction);
        intervalIdDeplacementsGeorges = setInterval(piloteDeplacementsGeorges, georges.vitesse);

    });

    //----------------------------------------------------------------------/
    //  Evénement clic sur bouton "baston again" de la page de jeu/rejeu    / 
    //----------------------------------------------------------------------/ 
    $('#btnBaston2').click(function () {

        // on stoppe l'animation du lien vers le CV
        $('#imgMonCv').removeClass('yoyo');

        scoreJeu.son.jouer.play();

        initialisationVariables();

        // Cacher les règles du jeu et afficher les éléments et protagonistes du jeu
        initStylePageJeu();

        //  Positionnement et mise en mouvement des personnages
        initPositionPersonnages();

        clearInterval(intervalIdGeorgesAction);
        intervalIdDeplacementsGeorges = setInterval(piloteDeplacementsGeorges, georges.vitesse);

    });

});
'use strict'

//*************************************************************************************************/
//*                     LA GESTION DES PERSONNAGES ARTHUR ET GEORGES                              */
//*===============================================================================================*/
//*  La technique des sprites est utilisée ici pour déplacer les personnages.                     */
//*  Ainsi, une feuille de sprites et un masque d'affichage sont associés à chaque personnage.    */
//*  Pour exploiter les sprites, chaque personnage est représenté par un objet qui contient les   */
//*  propriétés permettant de gérer leur déplacement selon l'action engagée :                     */
//*                                                                                               */
//*  - l'orientation des sprites du personnage, ceux d'Arthur le sont vers la droite, ceux de     */
//*    Georges vers la gauche                                                                     */
//*  - la direction du déplacement en cours                                                       */
//*  - pour chaque action que peut engager le personnage, il y a:                                 */ 
//*    . une table des positions et tailles des sprites concernés                                 */
//*    . le statut de l'action                                                                    */
//*    . le nombre de pixels pour un pas de déplacement, dans le cas du saut en demi-cercle       */
//*      ce sont des radians                                                                      */
//*    . un booléen(*) qui indique si on reboucle sur le 1er sprite quand on arrive au dernier    */
//*      sprite de la table                                                                       */
//*    . en cas de rebouclage(*), le nombre de rebouclages                                        */
//*    . une vitesse si l'action est déroulée avec une fonction répétée (avec setInterval).       */ 
//*                                                                                               */
//*  Il y a aussi des méthodes d'initialisation des propriétés.                                   */
//*                                                                                               */
//*  Pour dérouler une action, on accède à sa table de sprites et on la parcourt pour exécuter    */
//*  un pas par sprite :                                                                          */
//*  - ajustement du masque d'Arthur avec les dimensions du sprite accédé                         */
//*  - positionnement du sprite dans le masque                                                    */
//*  - déplacement du masque selon le pas indiqué (le pas peut être nul)                          */
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
//*  2) L'appui d'une touche déclenche le déroulement complet d'une action : nécessite donc la */
//*  répétition de l'éxécution d'un pas.                                                       */
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

var arthur = {
    actionPrecedente: null,

    // sens de déplacement de l'action en cours
    direction: {
        droite: true, gauche: false
    },
    // sprites orientés vers la droite
    orientation: 1,

    // L'action "attaque" est déclenchée par la touche entrée et est déroulée par un setInterval. Arrivé au dernier sprite on reboucle.
    attaque: {
        sprites: [
            { top: 30, left: -792, width: 118, height: 124 },
        ],
        statut: false,
        pas: 5,
        boucle: true,
        nbBoucles: 30,
        vitesse: 5
    },

    // L'action "attente" est déclenchée quand aucune touche n'est appuyée, elle est déroulée avec un setInterval et s'arrête dès qu'une touche est appuyée
    attend: {
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
    },

    // L'action "content" est déclenchée suite à une attaque réussie et est déroulée par un setInterval. Arrivé au dernier sprite on reboucle.
    content: {
        sprites: [
            { top: 2, left: -2, width: 83, height: 125 },
            { top: 2, left: -87, width: 83, height: 125 },
        ],
        statut: false,
        pas: 0,
        boucle: true,
        nbBoucles: 10,
        vitesse: 80
    },

    // L'action "court" est déclenché" par les touches flêches droite/gauche, à chaque appui Arthur se déplacement d'un pas. Quand on arrive au dernier sprite on reboucle.
    court: {
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
    },

    // Le mouvement mise KO d'Arthur est déclenché quand il y a collision avec les cornes de Georges. Il est déroulé avec un setInterval qui prend fin au dernier sprite.
    ko: {
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
    },
    // Le mouvement de saut est déclenché par une touche, déroulé avec un setInterval qui prend fin au dernier sprite. C'est un déplacement en demi-cercle selon un centre (x,y), le rayon et l'angle de départ, tous des propriétés du saut. Pour la gestion de la collision avec Georges, on distingue la phase ascendante et la descendante également propriétés du saut. Enfin, le pas est en radians. 

    saute: {
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
    },

    // L'action "vacille" est déclenchée quand Arthur percute un mur ou Georges et déroulée avec un setInterval(). Arrivé au dernier sprite on reboucle.
    vacille: {
        sprites: [
            { top: 0, left: -911, width: 96, height: 143 },
            { top: 0, left: -1006, width: 96, height: 143 },
        ],
        statut: false,
        pas: 0,
        boucle: true,
        nbBoucles: 5,
        vitesse: 100
    },

    // méthode d'initialisation des directions droite/gauche
    initDirection: function (droite, gauche) {
        this.direction.droite = droite;
        this.direction.gauche = gauche;
    },

    // méthode d'initialisation du statut des actions
    initStatuts: function () {
        this.attaque.statut = false;
        this.attend.statut = false;
        this.content.statut = false;
        this.court.statut = false;
        this.ko.statut = false;
        this.saute.statut = false;
        this.vacille.statut = false;
    },

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
//*  Comme pour Arthur, le déroulement complet d'une action est l'exécution répétée d'un pas   */
//*  de déplacement.                                                                           */
//*  La fonction pilote reprend la main quand le traitement de la collision est terminée.      */
//*============================================================================================*/

var georges = {

    actionPrecedente: null,
    // sens de déplacement en cours
    direction: {
        droite: false, gauche: true
    },
    vitesse: 42,
        // les sprites de Georges sont tous orientés vers la gauche
        orientation: -1,

        // Georges s'applatit quant Arthur lui saute sur le dos (collision)
        applati: {
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
        },

    // Georges attaque quand Arthur est à sa portée
    attaque: {
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
    },

    // Georges attend au début de la partie et de chaque round (mais pas longtemps)
    attend: {
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
    },

    // Georges court dès que la partie ou le round démarre, il cesse quand Arthur est à sa portée pour attaquer
    court: {
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
    },

    // Georges vacille quand Arthur lui porte un coup de face ou par derrière 
    vacille: {
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
    },

    initDirection: function (droite, gauche) {
        this.direction.droite = droite;
        this.direction.gauche = gauche;
    },

    initStatuts: function () {
        this.applati.statut = false;
        this.attaque.statut = false;
        this.attend.statut = false;
        this.court.statut = false;
        this.vacille.statut = false;
    },

};



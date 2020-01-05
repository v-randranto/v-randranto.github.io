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
//*  les méthodes de l'objet actionsCollision (ex. Arthur "vacille", "content" et "ko", Georges         */
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
var intervalIdArthurAction = null;
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
var piloteDeplacementsArthur = null;
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
var intervalIdGeorgesAction = null;
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


//----------------------------------------------------/
//      Variables pour la gestion d'Arthur            /
//----------------------------------------------------/

var $arthurMasque = $('#arthurMasque');
var bottomArthurMasque = $arthurMasque.css('bottom');
// var intervalIdArthurAction = null;

//----------------------------------------------------/
//      Variables pour la gestion de Georges          /
//----------------------------------------------------/
var $georgesMasque = $('#georgesMasque');

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
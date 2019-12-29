"use strict"

//**********************************************************************************************/
//*                                                                                            */
//*                     PRINCIPES DU JEU                                                       */
//*============================================================================================*/ 
//*  Pour gagner à ce jeu, Arthur doit récupérer les 12 blasons volés par Georges.             */
//*  Il doit affronter Georges et lui porter des coups pour reprendre des blasons.             */ 
//*  Arthur perd le jeu s'il est encorné par Georges ou s'il cumule 5 gamelles.                */ 
//*                                                                                            */
//*  Les coups gagnants :                                                                      */
//*  --------------------                                                                      */
//*  1) Georges n'est pas en position d'attaque, Arthur l'attaque et l'atteint :               */
//*     - de face : 1 blason gagné                                                             */
//*     - par derrière : 2 blasons gagnés                                                      */
//*  2) Arthur saute, retombe sur Georges et évite ses cornes : 3 blasons gagnés               */
//*                                                                                            */
//*  Les cas de gamelle :                                                                      */
//*  -------------- -----                                                                      */
//*  1) Arthur se cogne contre un mur                                                          */
//*  2) Arthur tamponne Georges sans l'attaquer (sauf coup fatal ci-dessous)                   */  
//*                                                                                            */
//*  Coup fatal, l'encornage par Georges :                                                     */
//*  -------------------------------------                                                     */ 
//*  1) Arthur attaque ou tamponne Georges alors que celui-ci est en position d'attaque        */
//*  2) Arthur saute et retombe sur les cornes relevées de Geroges                             */
//*  Dans ces 2 cas la partie est perdu pour Arthur                                            */
//*                                                                                            */
//**********************************************************************************************/


$(function () {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    //**********************************************************************************************/
    //*                                                                                            */
    //*                     LA GESTION DES PERSONNAGES ARTHUR ET GEORGES                           */
    //*                                                                                            */
    //*============================================================================================*/
    //*                                                                                            */
    //*  Chaque personnage est représenté par un objet qui contient les principales propriétés     */
    //*  suivantes :                                                                               */
    //*  - l'orientation des sprites du personnage                                                 */
    //*    (les sprites sont tous orientés dans un même sens)                                      */
    //*  - la direction du déplacement en cours du personnage                                      */
    //*  et pour chaque action que peut engager le personnage :                                    */ 
    //*  - une table des positions et tailles des sprites de l'image du personnage                 */
    //*  - le statut de l'action                                                                   */
    //*  - le nombre de pixels pour un pas de déplacement                                          */
    //*  - un booléen qui indique si on reboucle sur le 1er sprite quand on arrive au dernier      */
    //*  sprite de la table                                                                        */
    //*  - une vitesse si l'action est déroulée par un setInterval                                 */ 
    //*                                                                                            */
    //**********************************************************************************************/

    //*----------------------------------------------------------------------*/
    //*  Personnage d'Arthur                                                 */
    //*  TODO : à completer                                                  */
    //*----------------------------------------------------------------------*/
    var ArthurPersonnage = function () {
        this.actionPrecedente = null;

        // sens de déplacement de l'action en cours
        this.direction = {
            droite: true, gauche: false
        };
        //les sprites d'Arthur sont tous orientés vers la droite
        this.orientation = 1;

        this.attaque = {
            sprites: [
                { top: 30, left: -792, width: 118, height: 124 },
            ],
            statut: false,
            deplacement: 5,
            boucle: true,
            nbBoucles: 30,
            vitesse: 5
        };

        this.attend = {
            sprites: [
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
            ],
            statut: true,
            deplacement: 0,
            boucle: true,
            vitesse: 100
        };

        this.content = {
            sprites: [
                { top: 2, left: -2, width: 83, height: 125 },
                { top: 2, left: -87, width: 83, height: 125 },
            ],
            statut: false,
            deplacement: 0,
            boucle: true,
            nbBoucles: 10,
            vitesse: 80
        };

        this.court = {
            sprites: [
                { top: 0, left: -173, width: 86, height: 125 },
                { top: 0, left: -260, width: 86, height: 125 },
                { top: 0, left: -346, width: 86, height: 125 },
                { top: 0, left: -434, width: 85, height: 125 },
                { top: 0, left: -521, width: 85, height: 125 }
            ],
            statut: false,
            deplacement: 5,
            boucle: true,
            vitesse: 0
        };


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
            deplacement: -4,
            boucle: false,
            vitesse: 100
        };

        this.saute = {
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
            deplacement: Math.PI / 30,
            x0: 0,
            y0: 0,
            radian: Math.PI,
            rayon: 142,
            ascension: false,
            descente: false
        };

        this.vacille = {
            sprites: [
                { top: 0, left: -911, width: 96, height: 143 },
                { top: 0, left: -1006, width: 96, height: 143 },
            ],
            statut: false,
            deplacement: 0,
            boucle: true,
            nbBoucles: 5,
            vitesse: 100
        };

        // méthodes d'initialisation des propriétés
        this.initDirection = function (droite, gauche) {
            this.direction.droite = droite;
            this.direction.gauche = gauche;
        };

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

    //*----------------------------------------------------------------------*/
    //*  Personnage de Georges                                               */
    //*  TODO : à completer                                                  */
    //*----------------------------------------------------------------------*/
    var GeorgesPersonnage = function () {

        this.actionPrecedente = null;
        // sens de déplacement en cours
        this.direction = {
            droite: false, gauche: true
        };
        this.vitesse = 45,
            // les sprites de Georges sont tous orientés vers la gauche
            this.orientation = -1;

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
            deplacement: 0,
            boucle: false,
            vitesse: 80
        };

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
            deplacement: 0,
            boucle: false,
            nbBoucles: 2,
            vitesse: 0
        };

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
            deplacement: 0,
            boucle: true,
            vitesse: 50
        };

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
            deplacement: 7,
            boucle: true,
            vitesse: 0
        };

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
            deplacement: 0,
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

    //****************************************************************************************/
    //*              GESTION DU SCORE                                                        */
    //****************************************************************************************/
    //*   La variable scoreJeu référence un objet dont les propriétés                        */
    //*   et méthodes permettent de :                                                        */
    //*   - tenir le score des blasons retrouvés et les gamelles prises                      */
    //*   - d'afficher le score à chaque modification                                        */
    //*   - d'afficher par la page proposant de rejouer quand la partie est                  */
    //*   terminée                                                                           */
    //*   - d'afficher les blasons (compétences) retrouvés                                   */
    //*   Les logos blasons sont dans un spritesheet, tous de mêmes dimensions.              */
    //*   un objet blason, propriété de scoreJeu, contient les dimensions du sprite          */ 
    //****************************************************************************************/

    var scoreJeu = {
        blason: { width: 75, height: 91 },
        nbBlasons: 12,
        nbGamellesMax: 5,
        nbBlasonsRetrouves: 0,
        nbGamelles: 0,
        gagne: false,
        perdu: false,
        intervalIdBlasons: null,

        // Méthode pour afficher les blasons gagnés suite à une attaque d'Arthur
        afficheBlason: function () {
            $blasonsMasque.width(this.nbBlasonsRetrouves * this.blason.width);
        },

        // Méthode pour afficher le nombre de blasons gagnés et les gamelles prises par Arthur
        afficheScore: function () {
            $('#nbBlasons').html(this.nbBlasonsRetrouves + " / " + this.nbBlasons);
            $('#nbGamelles').html(this.nbGamelles + " / " + this.nbGamellesMax);

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
            sonBlason.play();
            this.afficheBlason();
            this.afficheScore();
        },

        // Méthode d'incrément du nombre de gamelles prises
        incrementGamelles: function () {
            this.nbGamelles++;
            if (this.nbGamelles == this.nbGamellesMax) {
                this.perdu = true;
            }
            sonGamelle.play();
            this.afficheScore();
        },

        initialisation: function () {
            this.nbBlasonsRetrouves = 0;
            this.nbGamelles = 0;
            this.gagne = false;
            this.perdu = false;
            this.intervalIdBlasons = null;
        },

        // Méthode appelée pour afficher la page proposant de rejouer
        proposeRejeu: function () {
            var resultat = this.gagne ? "Gagné !" : "Perdu !";
            afficherPageRejeu();
            $('#resultat').html(resultat);
            if (this.gagne)
                sonGagne.play();
            else
                sonPerdu.play();
        },

        // Méthode appelée pour mettre fin immédiatement à la partie quand Arthur prend un ko 
        rejeuDirect: function () {
            sonGamelle.play();
            this.perdu = true;
            this.afficheScore();
        },

        // Méthode appelée pour repositionner les personnages après une collision ou fin de partie
        repositionPersonnages: function () {

            // La partie est pas terminée
            if ((scoreJeu.perdu) || (scoreJeu.gagne)) {
                //on repositionne les personnages
                initPositionPersonnages();
                return;
            }

            // Collision avec Georges
            if (collision.avecGeorges) {
                //on repositionne les personnages
                initPositionPersonnages();
                intervalIdDeplacementGeorges = setInterval(gestionDeplacementGeorges, georges.vitesse);
            }

            // réactivation du clavier, cela permet de mettre Arthur automatiquement en attente.
            clavier.actif = true;
            clavier.touches.keyup = true;

        }

    };
    // TODO completer commentaires
    //*********************************************************************/
    //*                  GESTION DES COLLISIONS                           */
    //*-------------------------------------------------------------------*/
    //*  Fonctions de test des collisions                                 */
    //*  - Arthur / Georges avec les murs gauche et droit                 */
    //*  - Arthur avec George selon leur direction                        */
    //*********************************************************************/ 

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

            // Données d'Arthur 
            this.arthurData.x = $arthurMasque.offset().left;
            this.arthurData.y = $arthurMasque.offset().top;
            this.arthurData.w = $arthurMasque.width();
            this.arthurData.h = $arthurMasque.height();

            // Données de Georges 
            this.georgesData.x = $georgesMasque.offset().left;
            this.georgesData.y = $georgesMasque.offset().top;
            this.georgesData.w = $georgesMasque.width();
            this.georgesData.h = $georgesMasque.height();

            // Données des murs 
            this.murData.x = $('#scene').offset().left;
            this.murData.w = $('#scene').width();

        };

        // contrôle de la collision avec les murs
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
                this.arthurData.y + 20 < this.georgesData.y + this.georgesData.h  &&
                this.arthurData.h - 20 + this.arthurData.y > this.georgesData.y) {
                this.sautSurCornesGeorges = true;
                this.avecGeorges = true;
                console.log("collision sur cornes")
                console.dir(collision)
                console.dir(georges)
                console.dir(arthur)
                return true;
            }

        };

        // Collision d'Arthur avec le derrière de Georges pendant son saut
       
        this.checkSautSurDos = function () {

             // le dos est sur 2/3 de la largeur de Georges
            var georgesDataX = this.georgesData.x,
                georgesDataW = (this.georgesData.w * 2/ 3);

            if (georges.direction.gauche) {
                georgesDataX += this.georgesData.w / 3;
            }

            if (this.arthurData.x + 20 < georgesDataX + georgesDataW &&
                this.arthurData.x - 20 +  this.arthurData.w > georgesDataX &&
                this.arthurData.y + 20 < this.georgesData.y + this.georgesData.h &&
                this.arthurData.h - 20 + this.arthurData.y > this.georgesData.y) {
                this.sautSurDosGeorges = true;
                this.avecGeorges = true;
                console.log("collision sur dos")
                console.dir(collision)
                console.dir(georges)
                console.dir(arthur)
                return true;
            }

        };

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

    //============================================================/
    //  GESTION DES ACTIONS SUITE A UNE COLLISION                 / 
    //============================================================/

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

            // On cesse le parcours automatique de Georges
            clearInterval(intervalIdDeplacementGeorges);

            // Arthur saute
            if (arthur.saute.statut) {
                console.log("> collision arthur.saute")
                if (arthur.saute.ascension) {
                    console.log("> collision arthur.ascension")
                    if ((arthur.direction.droite !== georges.direction.droite) && georges.attaque.statut) {
                        console.log("> collision directions =/=, georges attaque, arthur KO")
                        initArthurKo();
                        intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                        scoreJeu.rejeuDirect();
                        return;
                    }
                    console.log("> collision directions = ou georges !attaque, arthur vacille")
                    initArthurVacille();
                    intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                    georgesAttend();
                    scoreJeu.incrementGamelles();

                    return;

                }

                // Arthur est dans la phase descendante de son saut
                console.log("> collision arthur.descente")
                //Georges attaque ou n'attaque pas mais Arthur tombe sur son dos
                if (georges.attaque.statut || (!georges.attaque.statut && collision.sautSurDosGeorges)) {
                    console.log("> collision georges.attaque ou (!georges.attaque et surCornes)");
                    console.log("-> arthur content")
                    initArthurContent();
                    intervalIdArthurAction = setInterval(arthurContent, arthur.content.vitesse);
                    initGeorgesApplati()
                    intervalIdGeorgesAction = setInterval(georgesApplati, georges.applati.vitesse);
                    scoreJeu.incrementBlasons(3);
                    return;
                }
                console.log("> collision !georges.attaque et surCornes)");
                console.log("-> arthur ko")
                // Arthur tombe sur les cornes 
                initArthurKo();
                intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                scoreJeu.rejeuDirect();
                return;
            }


            // Arthur et Georges se font face, duel à OK Corral...
            if (collision.frontal) {

                // Georges est à l'attaque : Arthur ne peut rien contre les cornes, game over !
                if (georges.attaque.statut) {
                    initArthurKo();
                    intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
                    scoreJeu.rejeuDirect();
                    return;
                }

                // Arthur est à l'attaque, Georges court ou attend => Georges vacille, +1 blason
                if (arthur.attaque.statut) {
                    initArthurContent();
                    intervalIdArthurAction = setInterval(arthurContent, arthur.content.vitesse);
                    georgesVacille();
                    scoreJeu.incrementBlasons(1);
                    return;
                }

                // Arthur court et Georges attend ou vice-versa => Arthur vacille, +1 gamelle
                initArthurVacille();
                intervalIdArthurAction = setInterval(arthurVacille, arthur.vacille.vitesse);
                georgesAttend();
                scoreJeu.incrementGamelles();
                return;
            }
            // Arthur et Georges sont dans une même direction et Arthur est devant       
            if (collision.arthurDevant) {

                // Georges est à l'attaque => Arthur est KO, game over !
                if (georges.attaque.statut) {
                    initArthurKo();
                    intervalIdArthurAction = setInterval(arthurKo, arthur.ko.vitesse);
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
                scoreJeu.incrementBlasons(2);
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

    //*****************************************************************************/
    //**                 GESTION DEPLACEMENT D'UN SPRITE                         **/
    //*****************************************************************************/
    // l'objet unMouvementSprite permet de gérer un 'pas' de déplacement pour Arthur et Georges, à savoir:
    // - se positionner sur le sprite à afficher
    // - déplacer le masque du sprite.
    //
    // Sa méthode 'action' est le moteur du déplacement. C'est elle qui est invoquée pour 
    // que le personnage effectue un 'pas':
    // - elle récupère l'objet personnage, son image de sprites (via son id), 
    // le nom de l'action en cours et l'indice du sprite à afficher pour l'action en cours.
    // - elle lance les méthodes qui permettent d'effectuer le 'pas' de déplacement
    //--------------------------------------------------------------------------------- */
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
        // accès au sprite de l'action à afficher
        accederImageSprite: function (indice) {
            this.$image.css({
                top: this.persoAction.sprites[indice].top,
                left: this.persoAction.sprites[indice].left
            });
        },

        deplacerMasque: function (indice) {

            // calcul du déplacement left du masque d'Arthur
            var deplacementLeft = parseFloat(this.$masque.css('left')) + (this.persoAction.deplacement * this.sensDeplacement);

            // on applique au masque les déplacements calculés et les dimensions du sprite du personnage en cours; l'image est affichage selon l'orientation et direction du personnage
            this.$masque.width(this.persoAction.sprites[indice].width).height(this.persoAction.sprites[indice].height).css({
                transform: 'scaleX(' + (this.sensDeplacement * this.orientation) + ')',
                left: deplacementLeft
            });

        },

        // Même principe que pour la fonction "deplacerMasque" mais le déplacement en (left, bottom) est calculé pour un saut en demi-cercle
        deplacerMasqueSaut: function (indice) {

            // calcul du déplacement en (left, bottom) du masque d'Arthur
            var deplacementLeft = this.persoAction.x0 + (this.persoAction.rayon * Math.cos(this.persoAction.radian));

            var deplacementBottom = this.persoAction.y0 - (this.persoAction.rayon * Math.sin(this.persoAction.radian));

            // on applique au masque les déplacements calculés et les dimensions du sprite d'Arthur en cours; l'image est affichage selon l'orientation et direction d'Arthur
            this.$masque.width(this.persoAction.sprites[indice].width).height(this.persoAction.sprites[indice].height).css({
                transform: 'scaleX(' + (this.sensDeplacement * this.orientation) + ')',
                left: deplacementLeft, bottom: deplacementBottom
            });

            // incrément du radian pour la prochaine position
            this.persoAction.radian += this.persoAction.deplacement * this.sensDeplacement;
        },

        action: function (personnage, idImage, nomAction, indice) {

            this.nomAction = nomAction;
            this.persoAction = personnage[nomAction];
            this.$masque = $(idImage + "Masque");
            this.$image = $(idImage);
            this.determinerSens(personnage);
            this.accederImageSprite(indice);
            if (nomAction === "saute") {
                this.deplacerMasqueSaut(indice);
            } else {
                this.deplacerMasque(indice);
            }
        }

    };

    //************************************/
    //*   GESTION DEPLACEMENTS GEORGES   */
    //************************************/

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
        unMouvementSprite.action(georges, "#georges", nomAction, indiceGeorges[nomAction]);
        indiceGeorges[nomAction]++;
    }

    var initGeorgesApplati = function () {
        georges.applati.statut = true;
    };

    var georgesApplati = function () {
        console.log(">georgesApplati")
        if (!georges.applati.sprites[indiceGeorges.applati]) {
            clearInterval(intervalIdGeorgesAction);
            indiceGeorges.applati = 0;
            return;
        }
        georgesAction("applati");
    };

    var georgesAttend = function () {
        clearInterval(intervalIdGeorgesAction);
        georges.initStatuts();
        georges.attend.statut = true;
        intervalIdGeorgesAction = setInterval(function () {
            georgesAction("attend")
        }, georges.attend.vitesse);
    };

    var georgesVacille = function () {
        clearInterval(intervalIdGeorgesAction);
        georges.initStatuts();
        georges.vacille.statut = true;
        intervalIdGeorgesAction = setInterval(function () {
            georgesAction("vacille")
        }, georges.vacille.vitesse);
    };

    //***********************************/
    //**  GESTION DEPLACEMENTS ARTHUR  **/
    //***********************************/

    // indices des actions d'Arthur
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
        unMouvementSprite.action(arthur, "#arthur", nomAction, indiceArthur[nomAction]);
        indiceArthur[nomAction]++;
    };

    var desactivations = function () {
        clavier.actif = false;
        clavier.reinitTouches();
        clearInterval(intervalIdArthurAction);
        arthur.initStatuts();
    };

    // Fonctions appelée pour l'éxécution d'un attaque d'Arthur
    var decompteAttaque = null;
    var initArthurAttaque = function () {
        desactivations();
        decompteAttaque = arthur.attaque.nbBoucles;
        arthur.attaque.statut = true;
    }
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

        arthurAction("attaque");

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

    var initArthurAttend = function () {
        clearInterval(intervalIdArthurAction);
        arthur.initStatuts();
        arthur.attend.statut = true;
    };

    // Variable rustine pour résoudre un bogue : il arrive que 2 actions de mise en attente d'Arthur soient en cours même temps. Je n'ai pas trouvé comment ce cas arrive
    var actionArthurAttend = false;

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

        arthurAction("attend");
    };

    var decompteContent = null;
    var initArthurContent = function () {
        desactivations();
        decompteContent = arthur.content.nbBoucles;
        arthur.content.statut = true;
        $arthurMasque.animate({ bottom: bottomArthurMasque }, 700)
    }

    var arthurContent = function () {

        if (decompteContent <= 0) {
            clearInterval(intervalIdArthurAction);
            arthur.content.statut = false;

            indiceArthur.content = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300);

            scoreJeu.repositionPersonnages();

            return;
        }
        arthurAction("content");
        decompteContent--;
    };

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

        arthurAction("ko");
    };

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
            arthur.saute.radian = Math.PI;
        } else {
            arthur.saute.x0 = parseFloat($arthurMasque.css('left')) - arthur.saute.rayon;
            arthur.saute.radian = 2 * Math.PI;
        }
    }

    // Fonction appelée pour l'éxécution du saut d'Arthur
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

        arthurAction("saute");

        if (arthur.direction.droite) {
            if (arthur.saute.radian >= radianFinAscension) {
                arthur.saute.ascension = false;
                arthur.saute.descente = true;
            }
        } else {
            if (arthur.saute.radian <= radianFinAscension) {
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

    var decompteVacille = null;
    var initArthurVacille = function () {
        desactivations();
        decompteVacille = arthur.vacille.nbBoucles;
        arthur.vacille.statut = true;
    };

    var arthurVacille = function () {

        if (decompteVacille <= 0) {
            clearInterval(intervalIdArthurAction);
            arthur.vacille.statut = false;

            indiceArthur.vacille = 0;
            $arthurMasque.animate({ bottom: bottomArthurMasque }, 300);
            scoreJeu.repositionPersonnages();

            return;
        }
        arthurAction("vacille");
        decompteVacille--;
    };

    //*********************************************************************************/
    //*                                                                               */
    //*       FONCTIONS POUR LES DEPLACEMENTS D'ARTHUR         */   
    //*       TODO : compléter les commentaires                */ 
    //*                                                                               */
    //*********************************************************************************/

    //*========================================================*/
    //*  Gestion du clavier et des touches                     */    
    //*========================================================*/

    //------------------------------------------------------------------/
    //  Les touches de déplacement d'Arthur sont :
    //  - flêche --> : aller à droite 
    //  - flêche <-- : aller à gauche
    //  - flêche ^| : saut
    //  - barre espace : attaque
    //
    //  Les touches de déplacement appuyées sont flaguées avec un booléen
    //------------------------------------------------------------------/

    var clavier = {
        actif: false,
        touches: {
            gauche: false,
            haut: false,
            droite: false,
            bas: false,
            entree: false,
            espace: false,
            keyup: false
        },
        dateDerniereTouche: 0,
        reinitTouches: function () {
            this.touches.gauche = false;
            this.touches.droite = false;
            this.touches.haut = false;
            this.touches.bas = false;
            this.touches.entree = false;
            this.touches.espace = false;
            this.touches.keyup = false;
        },
        uneToucheAppuyee: function () {
            return this.touches.gauche ||
                this.touches.droite ||
                this.touches.haut ||
                this.touches.bas ||
                this.touches.entree ||
                this.touches.espace;
        }
    };

    //----------------------------------------------------------/
    //  Détection de l'appui d'une touche de déplacement :     /
    //  - celle-ci est flagué à "true"                          /
    //----------------------------------------------------------/

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

    //*=========================================================================*/
    //*  requestAnimationFrame :                                                */ 
    //*  - teste les flags des touches action pour déplacer Arthur              */
    //*  TODO: à compléter                                             */    
    //*=========================================================================*/

    var gestionTouches = function () {

        if (arthur.ko.statut) {
            cancelAnimationFrame(rafIdTouches);
        }

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
            arthurAction("court");

            // test de la collision avec les murs
            if (collision.checkMurs(arthur.direction, $arthurMasque, 20)) {
                console.log("il y a collision");
                console.dir(collision);
                console.dir(arthur);
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
                    console.log("keyup: actionArthur déjà en cours !!!");
                    // TODO: trouver pourquoi
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

        rafIdTouches = requestAnimationFrame(gestionTouches);

    };
    //*********************************************************************************/
    //*                                                                               */
    //*       FONCTIONS POUR LES DEPLACEMENTS DE GEORGES         */   
    //*       TODO : compléter les commentaires                */ 
    //*                                                                               */
    //*********************************************************************************/

    var gestionDeplacementGeorges = function () {
        clearInterval(intervalIdGeorgesAction);

        var georgesAGauche = $georgesMasque.offset().left < $arthurMasque.offset().left;

        var arthurX, georgesX;
        if (georgesAGauche) {
            arthurX = $arthurMasque.offset().left;
            georgesX = $georgesMasque.offset().left + $georgesMasque.width();
        } else {
            arthurX = $arthurMasque.offset().left + $arthurMasque.width();
            georgesX = $georgesMasque.offset().left;
        }

        // Variable de la condition dans lesquelles Georges doit faire 1/2 tour pour faire face à Arthur
        var conditionDemiTour = (georges.direction.gauche
            && georgesAGauche) || (georges.direction.droite
                && arthur.direction.gauche
                && !georgesAGauche);

        var conditionAttaque = Math.abs(georgesX - arthurX) < distanceLimiteAttaque &&
            !conditionDemiTour;

        // Georges fait un demi-tour quand il a Arthur derrière lui mais seulement si Arthur n'est pas en train de sauter
        if (conditionDemiTour && !arthur.saute.statut && timer.on) {
            georges.direction.droite = !georges.direction.droite;
            georges.direction.gauche = !georges.direction.gauche;
        }

        // Georges attaque si Arthur est à sa portée mais pas systématiquement. Une fonction aléatoire détermine s'il attaque ou non

        if (conditionAttaque) {

            // instanciation d'un objet décisionAttaque
            if (!decisionAttaque) {
                decisionAttaque = new DecisionAttaque();
                if (decisionAttaque.aleatoire()) {
                    georges.initStatuts();
                    georges.attaque.statut = true;
                    georgesAction("attaque");
                    return;
                }
            }

            // La décision d'attaquer est prise
            if (decisionAttaque.attaqueOk) {

                // décision prise moins de 2 secondes avant, Georges attaque
                if (Date.now() - decisionAttaque.dateAttaqueOk < 2000) {
                    georges.initStatuts();
                    georges.attaque.statut = true;
                    georgesAction("attaque");
                    return;
                }

                // décision prise plus de 2 secondes avant, Georges reprend sa course
                georges.initStatuts();
                georges.court.statut = true;
                georgesAction("court");

                decisionAttaque = null;

                // Test Collision avec les murs 
                if (collision.checkMurs(georges.direction, $georgesMasque, 5)) {
                    //Georges fait demi-tour
                    georges.direction.droite = !georges.direction.droite;
                    georges.direction.gauche = !georges.direction.gauche;
                }
                return;
            }

            // il est décidé de ne pas attaquer
            if (decisionAttaque.attaqueKo) {

                // décision prise moins de 2 secondes avant, Georges reste en course
                if (Date.now() - decisionAttaque.dateAttaqueKo < 2000) {
                    georges.initStatuts();
                    georges.court.statut = true;
                    georgesAction("court");
                    // Test Collision avec les murs  
                    if (collision.checkMurs(georges.direction, $georgesMasque, 5)) {
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
            georgesAction("court");
            // Test collision avec les murs 
            if (collision.checkMurs(georges.direction, $georgesMasque, 5)) {
                //Georges fait demi-tour
                georges.direction.droite = !georges.direction.droite;
                georges.direction.gauche = !georges.direction.gauche;
            }

        }

    }

    //**************************************************************************/
    //*                                                                        */
    //*    INITIALISATION A L'ARRIVEE SUR L'APPLICATION                        */
    //*                                                                        */
    //**************************************************************************/

    //*======================================================================*/
    //* Ajustement de l'affichage des pages htm                              */
    //*======================================================================*/

    var hauteur = $(window).height();

    $('#index').height(hauteur - hauteur * 17 / 100);
    $('#jeu').height(hauteur - hauteur * 35 / 100);
    $('#scene').height(hauteur - hauteur * 35 / 100);
    $('#iframeCv').height(hauteur - hauteur * 18 / 100);

    var $jouer = $('#jouer');
    var $jouerPos = $jouer.offset()
    $('#rejouer').css({ top: $jouerPos.top, left: $jouerPos.left }).width($jouer.width());

    // fonctions pour calculer les positions des personnages aléatoirement (merci MDN)
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


    //*==========================================*/
    //*     Déclaration des variables            */
    //*==========================================*/

    var rafIdTouches = null;

    var flagPositionAleatoire = false;

    var collision = new Collision();
    var actionsCollision = new ActionsCollision();

    var radianFinAscension = Math.PI + Math.PI / 2;

    // pour Arthur
    var arthur = new ArthurPersonnage();
    var $arthurMasque = $('#arthurMasque');
    var bottomArthurMasque = $arthurMasque.css('bottom');
    var intervalIdArthurAction = null;

    // pour Georges
    var $georgesMasque = $('#georgesMasque');
    var georges = new GeorgesPersonnage();
    var nbBouclesVacille = georges.vacille.nbBoucles;
    var intervalIdGeorgesAction = null;
    var intervalIdDeplacementGeorges = null;
    var distanceLimiteAttaque = 100;

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

    // pour le score
    var $blasonsMasque = $('#blasonsMasque');
    var sonJouer = document.getElementById("sonJouer");
    var sonBlason = document.getElementById('sonBlason');
    var sonGamelle = document.getElementById('sonGamelle');
    var sonGagne = document.getElementById('sonGagne');
    var sonPerdu = document.getElementById('sonPerdu');

    //*===========================================================================*/
    //*         POSITIONNEMENT DES PERSONNAGES                                    */
    //*---------------------------------------------------------------------------*/
    //* Le jeu demarre :                                                          */ 
    //* - les personnages ont une position initiales                              */ 
    //*                                                                           */
    //* Arthur prend une gamelle (il vacille) mais la partie n'est pas terminée:  */ 
    //* - les personnages sont repositionnés                                      */
    //* - le clavier doit être actif                                              */
    //*                                                                           */
    //* La partie est terminée :                                                  */
    //* - les personnages sont repositionnés                                      */
    //* - le clavier doit désactivé, il sera réactivé si choix de rejouer         */
    //*===========================================================================*/

    // applique une temporisation
    var delai = function (duree) {
        var debut = Date.now(),
            fin = Date.now();
        while (fin - debut < duree) {
            fin = Date.now();
        }
    };

    var timer = {
        on: false
    }

    setInterval(function () {
        timer.on = !timer.on;
    }, 2500);

    // mise en mouvement des personnages  
    var miseEnMouvementPersonnages = function () {

        // Arthur
        arthur.actionPrecedente = "attend";
        initArthurAttend();
        intervalIdArthurAction = setInterval(arthurAttend, arthur.attend.vitesse);

        // Georges
        georges.actionPrecedente = "attend";
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
        $arthurMasque.css({ left: positionArthur }, { bottom: '20px' });

        // Georges
        //----------
        clearInterval(intervalIdDeplacementGeorges);
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

    //*---------------------------------------*/
    //*    L'UTILISATEUR A DECIDE DE JOUER    */
    //*---------------------------------------*/

    // fonction d'affichage de l'espace de jeu dans la page jeu.html
    var initStylePageJeu = function () {
        $('#rdj').css('display', 'none');
        $('#jouer').css('display', 'block');
        $('#rejouer').css('display', 'none');
    }

    // fonctions d'affichage de la page de rejeu dans la page jeu.html
    var afficherPageRejeu = function () {
        $('#rejouer').css('display', 'block').height($('#scene').height()).width($('#scene').width());
    }

    var $jouer = $('#btnJouer');
    $jouer.click(function () {

        sonJouer.play();

        initialisationVariables();

        // on cache les règles du jeu et on affiche l'espace de jeu
        initStylePageJeu();

        //  Positionnement et mise en mouvement des personnages
        initPositionPersonnages();

        // démarrer la gestion des touches de déplacement d'Arthur     
        gestionTouches();

        clearInterval(intervalIdGeorgesAction);
        intervalIdDeplacementGeorges = setInterval(gestionDeplacementGeorges, georges.vitesse);

    });

    var $rejouer = $('#btnJouer2');
    $rejouer.click(function () {

        sonJouer.play();

        initialisationVariables();

        // on cache les règles du jeu et on affiche l'espace de jeu
        initStylePageJeu();

        //  Positionnement et mise en mouvement des personnages
        initPositionPersonnages();

        clearInterval(intervalIdGeorgesAction);
        intervalIdDeplacementGeorges = setInterval(gestionDeplacementGeorges, georges.vitesse);

    });

});
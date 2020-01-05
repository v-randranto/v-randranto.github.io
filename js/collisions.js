
//********************************************************************************************/
//*                            GESTION DES COLLISIONS                                        */
//*==========================================================================================*/
//*  Les collisions suivantes sont détectées et gérées :                                     */
//*                                                                                          */
//*  - contre les murs:                                                                      */
//*    . Arthur "court" ou "saute" et se mange le mur: il prend une gamelle et "vacille"     */
//*    . Georges "court" et approche un mur: il fait demi-tour.                              */
//*                                                                                          */
//*  - entre Arthur et Georges:                                                              */
//*    . Si Georges encorne Arthur (quoi que ce dernier fasse), celui-ci est "ko", Georges   */ 
//*      "attend" et la partie est perdue pour Arthur                                        */
//*    . Si Arthur saute sur le dos de Georges, il est "content" car il gagne 3 blasons et   */
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
//*  - avec les murs                                                                         */
//*  - entre Arthur et Georges                                                               */
//*  - et si Arthur saute, la collision avec le dos ou les cornes de Georges                 */
//*                                                                                          */
//*  2) Une variable référençant l'objet ActionsCollision permet:                            */          
//*  - de gérer les réactions des personnages suite à une collision: "content", "vacille",   */
//*    "applati", "ko", "attend"                                                             */
//*  - d'évaluer et d'enregistrer le score en faisant appel aux méthodes de "scoreJeu" qui   */
//*    incrémentent le nombre de gamelles ou de blasons retrouvés.                           */       
//********************************************************************************************/    

//*==========================================/
//*       DETECTION DES COLLISIONS           / 
//*==========================================/

var collision = {

    memeDirection: false,
    frontal: false,
    arthurDevant: false,
    avecMur: false,
    avecGeorges: false,
    sautSurCornesGeorges: false,
    sautSurDosGeorges: false,
    arthurData: { x: 0, y: 0, w: 0, h: 0 },
    georgesData: { x: 0, y: 0, w: 0, h: 0 },
    murData: { x: 0, w: 0 },

    // méthode appelée par les fonctions pilote des déplacements avant d'appeler les méthodes qui détectent les collisions. Elle initialise toutes les propriétés.
    initialisation: function () {

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

    },

    // méthode appelée par les fonctions pilote des déplacements pour détecter les collisions avec les murs
    checkMurs: function (direction, $masque, marge) {
        this.initialisation();
        var $masqueData = {
            x: $masque.offset().left,
            w: $masque.width(),
        }

        if (($masqueData.x - marge < this.murData.x && direction.gauche) || ($masqueData.x + marge + $masqueData.w > this.murData.x + this.murData.w) && direction.droite) {
            this.avecMur = true;
            return true;
        } else return false;
    },

    // Collision d'Arthur avec les cornes de Georges pendant son saut
    checkSautSurCornes: function () {

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

    },

    // Collision d'Arthur avec le dos de Georges pendant son saut
    checkSautSurDos: function () {

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

    },

    // méthode appelée par la fonction pilote des déplacements d'Arthur pour détecter les collisions avec Georges
    checkCollisionGeorges: function () {

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

var actionsCollision = {

    gereConsequences: function () {

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

    }

}

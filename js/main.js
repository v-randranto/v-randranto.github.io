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

//**********************************************************************************************/
//*  L'application comporte 5 fichiers .js:                                                    */
//*  - personnages.js contient les constructeurs des personnages d'Arthur et Georges et qui    */
//*    permettent des manipuler les sprites/masque                                             */ 
//*  - score.js permet l'enregistrement et l'affichage du score, de déterminer l'issue d'une   */
//*    partie                                                                                  */
//*  - collisions.js contient la détection des collisions, la gestion des comportements des    */
//*    suite à une collisison et les appels au méthodes du score                               */
//*  - deplacementPersonnages.js contient les composants liés au déplacement :                 */
//*    . un objet qui permet l'exécution d'un pas                                              */
//*    . les fonctions spécifiques aux actions de chacun des personnages                       */ 
//*    . les écouteurs d'événement sur les touches clavier                                     */ 
//*    . une fonction de pilotage du déplacement de chaqun des personnages                     */
//**********************************************************************************************/

$(function () {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    //*******************************************************************/
    //*          DEMARRAGE DE L'APPLICATION                             */
    //*******************************************************************/
    
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


    // initialisation des propriétés des variables objet
    var initialisationVariables = function () {

        scoreJeu.initialisation();
        scoreJeu.afficheScore();
        $('#blasonsMasque').width(0);
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
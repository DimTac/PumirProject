/* ------------ 
	FICHIER INITIALISANT LA ROUE : DECLARATION DES TABLEAUX QUI CONTIENNENT LES NOMS, IMAGES ET SLOGANS DES RESTOS PAR DEFAUT 
--------------------- */


$(document).ready(function(){
   $('#canvas').rouetourne({
     restoArray : ['Asiatique','Salade','Fast-Food','Brasserie','Pizza','Indien','Crêperie','Sandwich','Poisson','Viande'],
     restoArraySrc : ['img/asiatique.png','img/salade.png','img/fast-food.png','img/brasserie.png','img/pizza.png','img/indien.png','img/crepe.png','img/sandwich.png','img/poisson.png','img/viande.png'],
     restoArraySlogan : ['Faites chauffer les baguettes !', 'Un petit repas léger !', 'Le kebab c\'est cool', 'Un petit repas sympa autour d\'un verre !', 'Une bonne calzone !', 'L\'indien c\'est chouette', 'Un petit détour par la Bretagne...','Un petit repas rapide sur le pouce !', 'C\'est toujours le jour du poisson !','Une bonne petite grillade !']
   });
});
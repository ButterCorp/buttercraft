/**************************************************/
/*              Butter-craft                      */
/**************************************************/

// styles
import '../scss/index.scss';

// three.js
import * as THREE from 'three';
import 'gsap'
import 'three/examples/js/controls/PointerLockControls';

var camera, scene, renderer, geometry, material, mesh;
var controls, intersects;
let myTween;
let myTweenBack;
let myTweenObj;

var keys = [];
var stars=[];
document.onkeydown = function (e) {
    e = e || window.event;
    keys[e.keyCode] = true;
};

document.onkeyup = function (e) {
    e = e || window.event;
    keys[e.keyCode] = false;
};

var earth;
var pivotObject;

function init() {

    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    // cubes floor and color random
    for (var x = 0; x < 30; x++) {
        for (var y = 0; y < 30; y++) {
            var geometry = new THREE.BoxGeometry(2, 2, 2);
            var material = new THREE.MeshBasicMaterial({
                color: Math.floor(Math.random() * 16777215)
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x -= x * 2;
            mesh.position.z -= y * 2;
            mesh.position.y = -2;

            scene.add(mesh);
        }
    }

    // wall of cubes
    var hauteur = 0;
    var longueur = 0;

    for (var k = 0; k <= 5; k++) {

        for (var y = 0; y <= 29; y++) {
            var geometry4 = new THREE.BoxGeometry(2, 2, 2);
            var texture = new THREE.TextureLoader().load( 'images/mine.jpg' ); // Relatif au dossier build du projet
            var material4 = new THREE.MeshBasicMaterial( { map: texture } );
            var mesh4 = new THREE.Mesh(geometry4, material4);
            mesh4.position.x = longueur
            mesh4.position.z = -58
            mesh4.position.y = hauteur;
            longueur = longueur -2;

            scene.add(mesh4);
        }
        hauteur = hauteur+2;
        longueur = 0;
    }

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    // mouse view controls
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // pointer lock
    var element = document.body;

    var pointerlockchange = function (event) {
        if (document.pointerLockElement == element) {
            controls.enabled = true;
        } else {
            controls.enabled = false;
        }
    };
    var pointerlockerror = function (event) {};

    // hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('pointerlockerror', pointerlockerror, false);

    element.addEventListener('click', function () {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);

    //create sun
    var geometry = new THREE.SphereGeometry( 10, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sun = new THREE.Mesh( geometry, material );
    sun.position.x = 10;
    sun.position.y = 30;
    sun.position.z = -20;
    scene.add( sun );

    //create light
    var light = new THREE.PointLight( 0xffffff, 1, 3000 );

    sun.add( light );
    scene.add(new THREE.AmbientLight(0x909090));

    //create earth
    var geometry2 = new THREE.SphereGeometry( 5, 32, 32 );
    var material2 = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
    earth = new THREE.Mesh( geometry2, material2 );
    earth.position.x = -21;
    scene.add( earth );

    //earth rotates around the sun
    pivotObject = new THREE.Object3D();
    sun.add(pivotObject);
    pivotObject.add( earth );
}

//create stars particules
function addSphere(){

    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
    for ( var z= -1000; z < 1000; z+=20 ) {

        // Make a sphere (exactly the same as before). 
        var geometry   = new THREE.SphereGeometry(0.5, 32, 32)
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        var sphere = new THREE.Mesh(geometry, material)

        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        // Then set the z position to where it is in the loop (distance of camera)
        sphere.position.z = z;

        // scale it up a bit
        sphere.scale.x = sphere.scale.y = 2;

        //add the sphere to the scene
        scene.add( sphere );

        //finally push it to the stars array 
        stars.push(sphere); 
    }
}

//animate stars particules
function animateStars() { 
            
    // loop through each star
    for(var i=0; i<stars.length; i++) {
        
        var star = stars[i]; 
            
        // and move it forward dependent on the mouseY position. 
        star.position.z +=  i/10;
            
        // if the particle is too close move it to the back
        if(star.position.z>1000) star.position.z-=2000; 
        
    }

}  

var clock = new THREE.Clock();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    var speed = 10;
    // up
    if (keys[38] || keys[90]) {
        controls.getObject().translateZ(-delta * speed);
    }
    // down
    if (keys[40] || keys[83]) {
        controls.getObject().translateZ(delta * speed);
    }
    // left
    if (keys[37] || keys[81]) {
        controls.getObject().translateX(-delta * speed);
    }
    // right
    if (keys[39] || keys[68]) {
        controls.getObject().translateX(delta * speed);
    }

    earth.rotation.y += 3.2 * delta;
    pivotObject.rotation.y += 0.7 * delta;
    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObjects( scene.children );

    renderer.render(scene, camera);
    animateStars();

}

//function to fix bug about creation of cubes
Number.prototype.roundTo = function(num) {
    var nombre = this*(-1)

    var resto = nombre%num;
    if (resto <= (num/2)) { 
        return (nombre-resto)*(-1);
    } else {
        return (nombre+num-resto)*(-1);
    }
}

document.addEventListener('keypress', (event) => {
  
  const nomTouche = event.key;
  
  //C to add cube
  if (nomTouche == "c") {

     if (intersects.length != 0) {

        var appX = intersects[0].point.x.roundTo(2);
        var appY = Math.round(intersects[0].point.y);
        var appZ = intersects[0].point.z.roundTo(2);

        var geometry4 = new THREE.BoxGeometry(2, 2, 2);
        var texture = new THREE.TextureLoader().load( 'images/mine.jpg' ); 
        var material4 = new THREE.MeshBasicMaterial( { map: texture } );

        var mesh4 = new THREE.Mesh(geometry4, material4);
        mesh4.position.x = appX
        mesh4.position.z = appZ
        mesh4.position.y = appY+1;

        scene.add(mesh4);  

        //Add move effects when we create a cube with gsap
        myTweenObj = mesh4; 

        myTween = TweenLite.to(myTweenObj.rotation, 1, {
            y: Math.PI,
            ease: Expo.easeOut,
            onComplete: () => {
                myTween = null;
            }
        });
    }

  }

  //V to color cube in red
  if(nomTouche == "v"){
        if (intersects.length != 0) {        
            if (intersects[0].object.geometry.type != "SphereGeometry") {
                intersects[0].object.material.color.set( 0xff0000 );
            }
        }
    }

    //R to remove cube
    if(nomTouche == "r"){
        if (intersects.length != 0) {  
            if (intersects[0].point.y >= 0 && intersects[0].object.geometry.type != "SphereGeometry") {
                scene.remove(intersects[0].object);
            }
        }
    }

});

init();
addSphere();
animate();
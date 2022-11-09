const scoreEL = document.querySelector('#scoreEl')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576





function randomBetween(min, max){
   return  Math.random() * (max - min) + min
}

let player = new Player ()
let projectiles = []
let grids = []
let invaderProjectiles = []
let particles = []
let bombs = []
let powerUps = []

let keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500) + 500
let game = {
    over: false,
    active:true
}

let score = 0

function init() {
player = new Player ()
projectiles = []
grids = []
invaderProjectiles = []
particles = []
bombs = []
powerUps = []
score = 0
keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

frames = 0
randomInterval = Math.floor(Math.random() * 500) + 500
game = {
    over: false,
    active:true
} 

for (let i = 0; i < 100; i++){
    particles.push(
        new Particle({
    position:{
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
    },
    velocity: {
    x: 0,
    y: 0.6
    },
    
    radius: Math.random() * 2,
    color: 'white'
    
    
    }
    )
    )
    }


}





//Sterne Hintergrund





function createParticles({object, color, fades}) {
    for (let i = 0; i < 15; i++){
        particles.push(new Particle({
        position:{
            x: object.position.x + object.width /2,
            y: object.position.y + object.height /2
        },
        velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
        },
        
        radius: Math.random() * 3,
        color: color || '#EB4A75',
        fades
        
        
        }
        )
        )
        }
}

function createScoreLabel ({score = 100, object}){
const scoreLabel = document.createElement('label')
scoreLabel.innerHTML = score
scoreLabel.style.position = 'absolute'
scoreLabel.style.color = 'white'
scoreLabel.style.top = object.position.y + 'px'
scoreLabel.style.left = object.position.x + 'px'
scoreLabel.style.userSelect = 'none'

document.querySelector('#parentDiv').appendChild(scoreLabel)
gsap.to(scoreLabel, {
opacity: 0, 
y: -50,
duration: 1,
onComplete: () =>{
document.querySelector('#parentDiv').removeChild(scoreLabel)
}

})}

function collision({rectangle1, rectangle2}){
return(
    rectangle1.position.y + rectangle1.height >= 
    rectangle2.position.y &&
     rectangle1.position.x + rectangle1.width >=
     rectangle2.position.x && 
       rectangle1.position.x <= rectangle2.position.x + rectangle2.width
       )
    }

function endGame(){
    //Disappears Player
    setTimeout(() => {
        audio.gameOver.play()
        player.opacity = 0
        game.over = true
    }, 0)

    //Stops game
    setTimeout(() => {
     game.active = false
     document.querySelector('#RestartScreen').style.display = 'flex'
    }, 2000)

    createParticles({
        object: player,
        color: '#FF50DE',
        fades: true
     })

}

let spawnBuffer = 500
let fps = 60
let fpsInterval = 1000/fps
let msPrev = window.performance.now ()

function animate(){
    if(!game.active) return
    requestAnimationFrame(animate)

const msNow = window.performance.now ()
const elapsed = msNow - msPrev

if(elapsed <fpsInterval) return
msPrev = msNow - (elapsed % fpsInterval)

    c.fillStyle = 'black'
    c.fillRect(0,0,canvas.width, canvas.height)

    for (let i = powerUps.length - 1; i >= 0; i--){
        const powerUp = powerUps[i]
        if (powerUp.position.x - powerUp.radius >= canvas.width)
        powerUps.splice(i, 1)
        else powerUp.update()
    }


//Spawn Powerups
    if (frames %600=== 0 || frames === 100 ){
      powerUps.push (
        new PowerUp ({
            position:{
                x: 0,
                y: Math.random() * 300 + 15
            },
            velocity: {
                x:(Math.random() +0,5) * 1.2,
                y:Math.random() * 2
            }
        })
      )
    }


    //Spawn Bombs
    if (frames %600=== 0 && bombs.length < 3 || frames === 100 && bombs.length < 3){
        bombs.push(new Bomb({
            position:{
                x:randomBetween(Bomb.radius, canvas.width - Bomb.radius),
                y:randomBetween(Bomb.radius, canvas.height - Bomb.radius)
            },
            velocity: {
                x:(Math.random() - 0.5) * 6,
                y:(Math.random() - 0.5) * 6
            }
        }))
    }

for (let i = bombs.length - 1; i >= 0; i --){
const bomb = bombs [i]
if (bomb.opacity <= 0){
    bombs.splice(i,1)
} else bomb.update()
}


    player.update()

    for(let i = player.particles.length -1; i >= 0; i--){
        const particle = player.particles[i]
        particle.update()

        if(particle.opacity === 0) player.particles[i].splice(i,1)
    }

//partikel
particles.forEach((particle, i) =>{

if(particle.position.y - particle.radius >= canvas.height){
    particle.position.x = Math.random() * canvas.width
    particle.position.y =  - particle.radius
}

 if(particle.opacity<=0){
    setTimeout(() => {
        particles.splice(i,1)   
    },0)
 }   else {
particle.update()
 }

})


    invaderProjectiles.forEach((invaderProjectile, index) => {
     if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
        setTimeout(() => {
            invaderProjectiles.splice(index, 1)
        }, 0)
     } else 
       
        invaderProjectile.update()
//Getroffen/Game Over
if (
    collision({
        rectangle1: invaderProjectile,
        rectangle2: player
    })
        ){
            invaderProjectiles.splice(index, 1)
          endGame()
}
    })


for (let i = projectiles.length -1; i >= 0; i--){
const projectile = projectiles[i]

for (let j = bombs.length -1; j >= 0; j--){
    const bomb = bombs [j]

    //Projektil trifft Bombe
    if (Math.hypot(
        projectile.position.x - bomb.position.x, 
        projectile.position.y - bomb.position.y
        )< 
        projectile.radius + bomb.radius && !bomb.active
        ){
        projectiles.splice(i, 1)  
        bomb.explode()
    }
}


for (let j = powerUps.length -1; j >= 0; j--){
    const powerUp = powerUps [j]

    //Projektil trifft Powerup
    if (Math.hypot(
        projectile.position.x - powerUp.position.x, 
        projectile.position.y - powerUp.position.y
        )< 
        projectile.radius + powerUp.radius
        ){
        projectiles.splice(i, 1)  
        powerUps.splice(j, 1)  
        player.powerUp = 'MachineGun'
        audio.bonus.play()

        setTimeout(() =>{
        player.powerUp = null
        },2000)
    }
}

    
        if (projectile.position.y + projectile.radius <= 0){
            projectiles.splice(i, 1)
    } else 

    {
projectile.update() 
        }

}

    grids.forEach((grid, gridIndex) => {
        grid.update()

//Gegner schießen lassen
if (frames % 200 === 0 && grid.invaders.length>0){
    grid.invaders[Math.floor(Math.random () * grid.invaders.length)].shoot(invaderProjectiles)
}


for (let i =  grid.invaders.length -1; i >= 0; i--){
    const invader = grid.invaders[i]

            invader.update({velocity: grid.velocity})


            for (let j = bombs.length -1; j >= 0; j--){
                const bomb = bombs [j]
            const invaderRadius = 15
                //Bomben Explosion berüht Invader -> entferne Invader
                if (Math.hypot(
                    invader.position.x - bomb.position.x,
                    invader.position.y - bomb.position.y
                    )< 
                    invaderRadius + bomb.radius && bomb.active
                    ){
                        score += 50
                        scoreEL.innerHTML = score
                    grid.invaders.splice(i, 1)  
                    createScoreLabel({
                        object: invader,
                        score: 50

                    })
                    createParticles({
                        object: invader,
                        fades: true
                     })
            
                }
            }

            //Projektile treffen
          projectiles.forEach((projectile, j) =>{
            if(
                projectile.position.y - projectile.radius <=
                invader.position.y + invader.height &&
                 projectile.position.x + projectile.radius >=
                  invader.position.x && projectile.position.x -
                projectile.radius <= invader.position.x + invader.width &&
                 projectile.position.y + projectile.radius >= invader.position.y
                  
                  ){


                setTimeout(() =>{
                    const invaderFound = grid.invaders.find(invader2 =>
                    invader2 === invader
                    )
                    const projectileFound = projectiles.find(projectile2 => projectile2 == projectile)
                  
                    //entferne Invader und Projektil
                    if (invaderFound && projectileFound){
                        score += 100
                        scoreEL.innerHTML = score

                        //dynamisches Score Popup
                        createScoreLabel({
                            object: invader
                        })
        

                     createParticles({
                        object: invader,
                        fades: true
                     })
                     //Projectile hits one invader
                     audio.explode.play()
                    grid.invaders.splice(i, 1)
                    projectiles.splice(j, 1)

                    if (grid.invaders.length > 0){
                        const firstInvader = grid.invaders[0]
                        const lastInvader = grid.invaders[grid.invaders.length -1]

                        grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                        grid.position.x = firstInvader.position.x
                    } else {
                        grids.splice(gridIndex, 1)
                    }
                    }
                },0)
                
            } 
          }
          )  
// Remove Player if Invader touches
if (
    collision({
        rectangle1: invader,
        rectangle2: player
    }) && !game.over
    ){
        endGame()
    }

        } // End Looping 
    })


    if (keys.a.pressed && player.position.x >= 0){
        player.velocity.x = -7
        player.rotation = -0.12
    }  else if (keys.d.pressed && player.position.x +player.width <= canvas.width){
        player.velocity.x = 7
        player.rotation =  0.12

    }
    
    else {
        player.velocity.x = 0
        player.rotation =  0
    }
//spawn enemies
    if (frames % randomInterval  === 0 ){
        spawnBuffer = spawnBuffer < 0 ? 200 : spawnBuffer
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 200 + spawnBuffer)
        frames = 0
        spawnBuffer -= 50
    }


    //Machine Gun
    if (keys.space.pressed && player.powerUp === 'MachineGun' && frames % 4 === 0 && !game.over){
    if (frames % 6) audio.shoot.play()
    projectiles.push(new Projectile({
        position:{
            x: player.position.x + player.width/2,
            y:player.position.y 
    },
    velocity: {
        x:0,
        y:-10
    },

    color: 'yellow'
    
    }))
    }
    frames++
}

document.querySelector('#StartButton').addEventListener('click', () => {
audio.backgroundMusic.play()
audio.start.play()
document.querySelector('#StartScreen').style.display = 'none'   
document.querySelector('#scoreC').style.display = 'block'  
init()
animate()
})

document.querySelector('#RestartButton').addEventListener('click', () => {
    audio.select.play()
    document.querySelector('#RestartScreen').style.display = 'none' 
    init()  
    animate()
    })


addEventListener('keydown', ({key}) => {
if(game.over) return

    switch (key) {
    case 'a': 
    keys.a.pressed = true
    break

    case 'd': 

    keys.d.pressed = true
    break

  
    case ' ': 
    keys.space.pressed = true
if (player.powerUp === 'MachineGun') return
audio.shoot.play()
    projectiles.push(new Projectile({
        position:{
            x: player.position.x + player.width/2,
            y:player.position.y 
    },
    velocity: {
        x:0,
        y:-10
    }
    
    }))
    //keys.space.pressed = true
   break
}
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'a': 
        keys.a.pressed = false
        break
    
        case 'd': 
    
        keys.d.pressed = false
        break
    
        case ' ': 

    
        keys.space.pressed = false
        break
    }
    })

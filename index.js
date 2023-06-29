const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d')

canvas.width = window.innerWidth //whole screen width & height
canvas.height = window.innerHeight

//C.fillStyle = 'black'
//C.fillRect(0, 0, canvas.width, canvas.height) // arguments(x, y, width, height)

class Player { 
    // This method constructor will called everytime we will create new player
    constructor({ position, velocity }) {
        this.position = position // {x,y}
        this.velocity = velocity
        this.rotation = 0 // it just need 0 radian rotation to start drawing
    }

    draw() {
        C.save()
        C.translate(this.position.x, this.position.y) // Taking centre position
        C.rotate(this.rotation) //it will roate whole canva screen but w ejust want to rotate spaceship from its center position
        C.translate(-this.position.x, -this.position.y)

        //For darwing circle we use arc method
        //We are checking whether player is made in center or not
        // arguments(x, y, radius, beginning angle of an arc always be 0, radians or complete circle 360deg, direction false for counterclockwise & True for clockwise)
        C.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        C.fillStyle = 'red'
        C.fill()

        // C.fillStyle = 'red'
        // C.fillRect(this.position.x, this.position.y, 100, 100)

        // Drawing a Triangle
        C.beginPath()
        C.moveTo(this.position.x + 30, this.position.y)
        C.lineTo(this.position.x - 10, this.position.y - 10)
        C.lineTo(this.position.x - 10, this.position.y + 10)
        C.closePath()

        C.strokeStyle = 'white'
        C.stroke()
        C.restore()
    }
    
    // updating & creating new player each time player starts to moving
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player({
    position: { x:canvas.width / 2, y:canvas.height / 2}, //For centering the position 
    velocity: { x:0, y:0 },
})

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

//player.draw()

const SPEED = 3
const ROTATIONAL_SPEED = 0.05
const FRICTION = 0.97

function animate() {
    // This method calls animate over & over again 
    window.requestAnimationFrame(animate)
    //console.log('animate')
    C.fillStyle = 'black'
    C.fillRect(0, 0, canvas.width, canvas.height)

    player.update()
    
    //player.velocity.x = 0 // else statemnet just write it lie that for cleaner code
    //player.velocity.y = 0 

    if (keys.w.pressed) {  // moving player to right direction
        player.velocity.y = Math.sin(player.rotation) * SPEED // use this Math function to move player in up/down direction as it was movng on right stiil after rotating it
        player.velocity.x = Math.cos(player.rotation) * SPEED  
    }   else if (!keys.w.pressed) { // using this to directly not stop space ship it will take 0.97 time to stop slowly
        player.velocity.x *= FRICTION
        player.velocity.y *= FRICTION
    }
    
    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED //radians. Moving player in clockwise direction
       else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED // Moving player in anti-clockwise direction

}

animate()

//console.log(player)

window.addEventListener('keydown', (event) => { // other methods are mouse click, touch etc. whenever person put finger on key so keydown method will work
    switch (event.code) { // switch is same as if else conditions
        // using code = keyH it will work same as lowercase & uppercase. If you will use Key = H / h so you have to click capslock for capital H 
        case 'KeyW':
            //console.log('w was pressed')
            keys.w.pressed = true
            break   
        case 'KeyA':
            //console.log('a was pressed')
            keys.a.pressed = true
            break   
        case 'KeyD':
            //console.log('d was pressed')
            keys.d.pressed = true
            break   
    }
})

 // Method for calling Keyup when u will stop pressing key spacesip will stop moving
window.addEventListener('keyup', (event) => { 
    switch (event.code) { 
       
        case 'KeyW':
            keys.w.pressed = false
            break   
        case 'KeyA':
            keys.a.pressed = false
            break   
        case 'KeyD':
            keys.d.pressed = false
            break   
    }
})


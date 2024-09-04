# This is a sample of what the compiler would generate

```js
var y = "a string"
log(y + "ing")

var nothing = null

fun foo = () {
    log("foo")
}

foo()

on (true) {
    log("Tick")
    
    if (input.keyboard.esc.is_pressed) {
        log("ESC pressed")
    }
}

on (frame) {
	log("Frame!")
}
  

on (timer % 2 == 0) {
    log("2s Elapsed")

    foo()
    game_objects.terminal.buzz()

    game_object.sprite += 1
}
```

# Output

```js
const getIsRunning = () => true

const game_objects = {
	"id": {
		transform: {
			x: 0,
			y: 0,
			rotation: 0,
			width: 100,
			height: 100,
		},
		// on: [{ condition, callback }]
		// y
		// nothing
		// foo
	}
}

// Inbuilt language functions
function log(message) { console.log(message) }
async function sleep(ms) {
  await new Promise((resolve, reject) => {
    setTimeout(() => (
      getIsRunning() ? resolve(null) : reject("Game stopped")
    ), ms)
  })
}

// Inbuilt engine vars
let frame = false
let time = {
	frame_time: 1, // Default to 1
	start_timestamp: new Date().now,
	get timestamp() { return new Date().now },
	get timer() { return this.timestamp - this.start_timestamp }
}

// Inbuilt engine functions
const render = () => { /* ... */ }
async function tick() {
  const start = performance.now()
  await sleep(0)
  const end = performance.now()

  return (end - start) / 1000
}
async function wait_frame() {
  await new Promise((resolve, reject) => {
    requestAnimationFrame(() => (
      getIsRunning() ? resolve(null) : reject("Game stopped")
    ))
  })
}

// For each game_object
;(() => {
	const game_object = game_objects["id"]

	// Link inbuilt engine functions to game_object
	// Mappings in InbuiltEngineFunctions:
	// { "transform.rotate_to": rotate_to }
	Object.defineProperty(game_objects["id"]["transform"], 'rotate_to', {
		get: (...params) => rotate_to(game_objects["id"], ...params)
	})

	// Compiler generated code
	let y = "a string"
	let nothing = null
	function foo() {
		log("foo")
	}

	// Register "on" blocks
	game_object.on = [
		{
			get condition() { return true },
			callback: () => {
				log("Tick")
			    if (input.keyboard.esc.is_pressed) {
			        log("ESC pressed")
			    }
			}
		},
		{
			get condition() { return frame },
			callback: () => {
				log("Frame!")
			}
		},
		{
			get condition() { return time.timer % 2 === 0 },
			callback: () => {
			    log("2s Elapsed")
			    foo()
			    game_objects.terminal.buzz()
			    game_object.sprite += 1
			}
		}
	]

	// Register global scope vars/functions (Generated outside compiler)
	Object.defineProperty(game_object, 'y', {
		get: () => y,
		set: (value) => y = value
	})
	Object.defineProperty(game_object, 'nothing', {
		get: () => nothing,
		set: (value) => nothing = value
	})
	Object.defineProperty(game_object, 'foo', {
		get: () => foo
	})
})()

;(async () => {
	while (true) {
		await wait_frame()
		frame = true
	}
})()

;(async () => {
    while (getIsRunning()) {
		for (game_object of Object.values(game_objects)) {
			for (on_listener of game_object.on) {
				if (on_listener.condition) on_listener.callback()
			}
		}
	
		if (frame) frame = false
		await tick()
	}
})()
```
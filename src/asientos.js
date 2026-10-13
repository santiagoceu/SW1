const canvas = document.getElementById("select-seats");
const ctx = canvas.getContext("2d");

STATE_COLOR = {
    Available: "lime",
    Selected: "blue",
    Unavailable: "red"
}

canvas.addEventListener("click", function(e) {
    let seat = seatAt(e.offsetX, e.offsetY);
    if (seat) {
        if (seat.isAvailable()) {
            seat.toggleState();  // Si disponible, cambiar entre elegido y no elegido.
        } else {
            notAvailableAlert();
        }
    }
    
})

class Seat {
    constructor(posX, posY, state) {
        this.posX = posX;
        this.posY = posY;
        this.state = state;  // Available, Unavailable, Selected
    }

    isAvailable() {
        if (this.state == "Unavailable") {
            return false;
        } else {
            return true;
        }
    }

    toggleState() {
        if (this.state == "Available") {
            this.state = "Selected";
        } else if (this.state == "Selected") {
            this.state = "Available";
        }
        this.draw();
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = STATE_COLOR[this.state];
        ctx.arc(this.posX, this.posY, 50, 0, 2 * Math.PI);
        ctx.fill()
    }
}

let seat = new Seat(100, 100, "Available");

function seatAt(x, y) {
    return seat;
}

seat.draw()


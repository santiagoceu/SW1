const canvas = document.getElementById("select-seats");
const ctx = canvas.getContext("2d");

STATE_COLOR = {
    Available: "lime",
    Selected: "blue",
    Unavailable: "red"
}


class Seat {
    constructor(posX, posY, state, size) {
        this.posX = posX;
        this.posY = posY;
        this.state = state;  // Available, Unavailable, Selected
        this.size = size;
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
        ctx.arc(this.posX, this.posY, this.size, 0, 2 * Math.PI);
        ctx.fill()
    }
}

class Seating {
    constructor(seatData) {
        this.seatData = seatData;  // json {[{col:1, row:2, state:"Available"}, ...]}
        this.seatSize = 10;
        this.seats = this.createSeats()  // lista conteniendo los objetos de asiento
        
        console.log(this.seatSize);
    }

    createSeats() {
        let seatData = this.seatData.seats;  // Una lista
        let rows = this.seatData.numberOfRows;
        let cols = this.seatData.numberOfColumns;
        
        let width = canvas.width;
        let height = canvas.height;
        let margin = Math.round(canvas.width * 0.1);  // Cambiar esto para que no asuma cuadrados
        let seats = [];

        seatData.forEach(seat => {
            let colSpacing = (width - 2 * margin) / cols
            let rowSpacing = (height - 2 * margin) / rows
            
            let dynamicX = (seat.col - 1) * colSpacing + margin;
            let dynamicY = (seat.row - 1) * rowSpacing + margin;

            seats.push(new Seat(dynamicX, dynamicY, seat.state, this.seatSize));
        });

        return seats;
    }

    seatAt(x, y) {
        for (let i = 0; i < this.seats.length ; i++){
            let seat = this.seats[i];
            
            let seatX = seat.posX;
            let seatY = seat.posY;
            
            let xMatches = x > seatX - seat.size && x < seatX + seat.size;
            let yMatches = y > seatY - seat.size && y < seatY + seat.size;
            if (xMatches && yMatches) {
                console.log("Matches!");
                return seat;
            }
        };
    }

    handleClick(e) {
        let seat = seating.seatAt(e.offsetX, e.offsetY);
    
        if (seat) {
            if (seat.isAvailable()) {
                seat.toggleState();  // Si disponible, cambiar entre elegido y no elegido.
            }
    }
    
}

    draw() {
        this.seats.forEach(seat => { seat.draw() });
    }
}


function loadSeating(id) {
    // Lo debería buscar de la base de datos. PLACEHOLDER
    data = {
        numberOfRows: 2,
        numberOfColumns: 4,
        seats:[
            {
            row: 1,
            col: 1,
            state: "Available"
            },
            {
            row: 1,
            col: 2,
            state: "Available"
            },
            {
            row: 1,
            col: 3,
            state: "Available"
            },
            {
            row: 1,
            col: 4,
            state: "Available"
            },
            {
            row: 2,
            col: 1,
            state: "Unavailable"
            },
            {
            row: 2,
            col: 2,
            state: "Unavailable"
            },
            {
            row: 2,
            col: 3,
            state: "Unavailable"
            },
            {
            row: 2,
            col: 4,
            state: "Available"
            }
        ]
    }
    return data;
}


let id = "placeholder";

let seatingData = loadSeating(id);

let seating = new Seating(seatingData);

seating.draw()

canvas.addEventListener("click", seating.handleClick)
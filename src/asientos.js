const canvas = document.getElementById("select-seats");
const ctx = canvas.getContext("2d");

const STATE_COLOR = Object.freeze({
    Available: "lime",
    Selected: "blue",
    Unavailable: "red"
})


class Seat {
    constructor(posX, posY, state, size) {
        this.posX = posX;
        this.posY = posY;
        this.state = state;  // Available, Unavailable, Selected
        this.size = size;
    }

    isAvailable() {
        return this.state !== "Unavailable";
    }

    toggleState() {
        if (this.state === "Available") {
            this.state = "Selected";
        } else if (this.state === "Selected") {
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
            
            let dynamicX = (seat.col - 1) * colSpacing + margin * 1.5;
            let dynamicY = (seat.row - 1) * rowSpacing + margin * 1.5;

            seats.push(new Seat(dynamicX, dynamicY, seat.state, this.seatSize));
        });

        return seats;
    }

    seatAt(x, y) {
        for (const seat of this.seats){
            let seatX = seat.posX;
            let seatY = seat.posY;
            
            let xMatches = x > seatX - seat.size && x < seatX + seat.size;
            let yMatches = y > seatY - seat.size && y < seatY + seat.size;
            if (xMatches && yMatches) {
                return seat;
            }
        };
    }

    handleClick(e) {
        let seat = this.seatAt(e.offsetX, e.offsetY);
    
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
    // {numberOfRows: int, numberOfColumns: int, seats:[{row: int, col: int, state: state}, ...]}
    let data = generateSeating(10, 10);
    return data;
}

function generateSeating(rows, columns) {
    let data = {}
    data.numberOfRows = rows;
    data.numberOfColumns = columns;
    data.seats = [];
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            data.seats.push({
                row: i,
                col: j,
                state: Math.random() > 0.2 ? "Available" : "Unavailable"
            })
        }
    }
    return data;
}

let id = "placeholder";

let seatingData = loadSeating(id);

let seating = new Seating(seatingData);

seating.draw()

canvas.addEventListener("click", (e) => {
    seating.handleClick(e);
})
export type Mode = "draw" | "erase";

export type Coordinate = {
  x: number;
  y: number;
}


// Use bitmap class?
export class bitMap {
    private map = new Map<Coordinate, number>()
}
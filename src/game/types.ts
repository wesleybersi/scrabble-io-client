import Remover from "./entities/remover";
import Laser from "./entities/Laser/laser";
import Crate from "./entities/Crate/crate";

// interface Adjacent {
//   top: [number, number];
//   bottom: [number, number];
//   left: [number, number];
//   right: [number, number];
// }

export type Cardinal = "top" | "bottom" | "left" | "right";
export type Direction = "up" | "down" | "left" | "right";

//    "Linear"
// ("Quad.In");
// ("Quad.Out");
// ("Quad.InOut");
// ("Cubic.In");
// ("Cubic.Out");
// ("Cubic.InOut");
// ("Quart.In");
// ("Quart.Out");
// ("Quart.InOut");
// ("Quint.In");
// ("Quint.Out");
// ("Quint.InOut");
// ("Sine.In");
// ("Sine.Out");
// ("Sine.InOut");
// ("Expo.In");
// ("Expo.Out");
// ("Expo.InOut");
// ("Circ.In");
// ("Circ.Out");
// ("Circ.InOut");
// ("Elastic.In");
// ("Elastic.Out");
// ("Elastic.InOut");
// ("Back.In");
// ("Back.Out");
// ("Back.InOut");
// ("Bounce.In");
// ("Bounce.Out");
// ("Bounce.InOut");

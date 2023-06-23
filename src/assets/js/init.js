import { Buffer } from "buffer";

var window = self;
window.Buffer = Buffer;
window.global ||= window;

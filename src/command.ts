import { createSocket, Socket } from 'dgram';
import { DataBlock, FuncType, Packet, Parameter, UnitOnOff } from './packet';

const PORT = 4000;

export class Command {
  private socket: Socket;

  private complete?: (value: Packet) => void;
  private fail?: (error: Error) => void;

  private constructor(private readonly func: FuncType, private readonly data: DataBlock[]) {
    this.socket = createSocket('udp4').on('message', this.response.bind(this)).on('error', this.cancel.bind(this));
  }

  public static status() {
    return new Command(FuncType.READ, [new DataBlock(Parameter.UNIT_ON_OFF), new DataBlock(Parameter.BOOST_ON_OFF)]);
  }

  public static triggerStatus() {
    return new Command(FuncType.READ, [new DataBlock(Parameter.TEMPERATURE_SENSOR_OPERATION), new DataBlock(Parameter.HUMIDITY_SENSOR_OPERATION), new DataBlock(Parameter.EXTERNAL_SWITCH_OPERATION), new DataBlock(Parameter.MOTION_SENSOR_OPERATION), new DataBlock(Parameter.SILENT_MODE_OPERATION)]);
  }

  public static onOff(value: UnitOnOff) {
    return new Command(FuncType.WRITE, [new DataBlock(Parameter.UNIT_ON_OFF, value)]);
  }

  public static boostOnOff(value: UnitOnOff) {
    return new Command(FuncType.WRITE, [new DataBlock(Parameter.BOOST_ON_OFF, value)]);
  }

  public async execute(ip: string, deviceId: string, password: string): Promise<Packet> {
    return new Promise((resolve, reject) => {
      this.complete = resolve;
      this.fail = reject;

      try {
        const request = new Packet(deviceId, password, this.func, this.data);
        this.socket.connect(PORT, ip, () => this.socket.send(request.toBytes()));
      } catch (e) {
        this.cancel();
      }
    });
  }

  public cancel(reason?: Error) {
    this.close();
    this.fail?.(reason || new Error());
  }

  private response(message: Buffer) {
    this.close();
    this.complete?.(Packet.fromBytes(message));
  }

  private close() {
    try {
      this.socket.close();
    } catch (e) {
      // ignore
    }
  }
}

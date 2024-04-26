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

  public static getStatus() {
    return new Command(FuncType.READ, [new DataBlock(Parameter.UNIT_ON_OFF), new DataBlock(Parameter.BOOST_ON_OFF)]);
  }

  public static getFanSpeeds() {
    return new Command(FuncType.READ, [new DataBlock(Parameter.SILENT_SPEED_SETPOINT), new DataBlock(Parameter.MAX_SPEED_SETPOINT)]);
  }

  public static setPower(value: UnitOnOff) {
    return new Command(FuncType.WRITE, [new DataBlock(Parameter.UNIT_ON_OFF, value)]);
  }

  public static setBoost(value: UnitOnOff) {
    return new Command(FuncType.WRITE, [new DataBlock(Parameter.BOOST_ON_OFF, value)]);
  }

  public static setFanSpeed(type: 'silent' | 'max', value: number ) {
    const Param = type === 'silent' ? Parameter.SILENT_SPEED_SETPOINT : Parameter.MAX_SPEED_SETPOINT;
    return new Command(FuncType.WRITE, [new DataBlock(Param, value)]);
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

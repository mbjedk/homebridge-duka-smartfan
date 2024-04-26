import { Command } from './command';
import { Packet, UnitOnOff } from './packet';
import { Device } from './device';
import Bottleneck from 'bottleneck';

const COMMAND_TIMEOUT = 2000;

export class DukaSmartFanClient {
  private limiter = new Bottleneck({ maxConcurrent: 1 });

  constructor(private readonly device: Device) {}

  public async getStatus(): Promise<{ active: UnitOnOff, boost: UnitOnOff }> {
    return this.send(Command.getStatus()).then((response) => ({
      active: response.data[0].value!,
      boost: response.data[0].value! && response.data[1].value!,
    }));
  }

  public async getFanSpeeds(): Promise<{ silent: number, max: number }> {
    return this.send(Command.getFanSpeeds()).then((response) => ({
      silent: response.data[0].value!,
      max: response.data[1].value!,
    }));
  }

  public async setActive(value: UnitOnOff): Promise<UnitOnOff> {
    return this.send(Command.setPower(value)).then((response) => response.data[0].value!);
  }

  public async setBoost(value: UnitOnOff): Promise<UnitOnOff> {
    return this.send(Command.setBoost(value)).then((response) => response.data[0].value!);
  }

  public async setFanSpeed(type: 'silent' | 'max', value: number): Promise<number> {
    return this.send(Command.setFanSpeed(type, value)).then((response) => response.data[0].value!);
  }


  private async send(command: Command): Promise<Packet> {
    return Promise.race([
      new Promise<Packet>((resolve, reject) =>
        setTimeout(() => {
          command.cancel();
          reject(new Error('Command timeout'));
        }, COMMAND_TIMEOUT)
      ),
      this.limiter.schedule(() => command.execute(this.device.ip, this.device.deviceId, this.device.password)),
    ]);
  }
}

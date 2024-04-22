import { Command } from './command';
import { Packet, UnitOnOff } from './packet';
import { Device } from './device';
import Bottleneck from 'bottleneck';

const COMMAND_TIMEOUT = 2000;

export class DukaSmartFanClient {
  private limiter = new Bottleneck({ maxConcurrent: 1 });

  constructor(private readonly device: Device) {}

  public async getStatus(): Promise<{ active: UnitOnOff }> {
    return this.send(Command.status()).then((response) => ({
      active: response.data[0].value!,
    }));
  }

  public async turnOnOff(value: UnitOnOff): Promise<UnitOnOff> {
    return this.send(Command.onOff(value)).then((response) => response.data[0].value!);
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

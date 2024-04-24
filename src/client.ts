import { Command } from './command';
import { Packet, UnitOnOff } from './packet';
import { Device } from './device';
import Bottleneck from 'bottleneck';

const COMMAND_TIMEOUT = 2000;

export class DukaSmartFanClient {
  private limiter = new Bottleneck({ maxConcurrent: 1 });

  constructor(private readonly device: Device) {}

  public async getStatus(): Promise<{ active: UnitOnOff, boost: UnitOnOff }> {
    return this.send(Command.status()).then((response) => ({
      active: response.data[0].value!,
      boost: response.data[0].value! && response.data[1].value!,
    }));
  }

  public async getTriggerStatus(): Promise<{
    tempSensor: UnitOnOff,
    humiditySensor: UnitOnOff,
    externalSwitchSensor: UnitOnOff,
    motionSensor: UnitOnOff,
    silentModeSensor: UnitOnOff
}> {
    return this.send(Command.triggerStatus()).then((response) => ({
      tempSensor: response.data[0].value!,
      humiditySensor: response.data[1].value!,
      externalSwitchSensor: response.data[2].value!,
      motionSensor: response.data[3].value!,
      silentModeSensor: response.data[4].value!
    }));
  }


  public async turnOnOff(value: UnitOnOff): Promise<UnitOnOff> {
    return this.send(Command.onOff(value)).then((response) => response.data[0].value!);
  }

  public async turnBoostOnOff(value: UnitOnOff): Promise<UnitOnOff> {
    return this.send(Command.boostOnOff(value)).then((response) => response.data[0].value!);
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

import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { DukaSmartFanPlatform } from './platform';
import { DukaSmartFanClient } from './client';
import { UnitOnOff } from './packet';
import { Device } from './device';

export class DukaSmartFanAccessory {
  private service: Service;
  private client: DukaSmartFanClient;

  constructor(
    private readonly platform: DukaSmartFanPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'DUKA')
      .setCharacteristic(this.platform.Characteristic.Model, 'SmartFan')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.deviceId);

    // Main Fan Control
    this.service =
      this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, device.name);

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getActive.bind(this))
      .onSet(this.setActive.bind(this));

    // Boost Control
    const boostControl = this.accessory.getService('Boost Control') ||
    this.accessory.addService(this.platform.Service.Fan, 'Boost Control', 'BOOST_CONTROL_SWITCH');

    boostControl.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getBoostOnOff.bind(this))
      .onSet(this.setBoost.bind(this));

    // Triggers
    const externalSwitchSensor = this.accessory.getService('External Switch Sensor') ||
    this.accessory.addService(this.platform.Service.MotionSensor, 'External Switch Sensor', 'EXTERNAL_SWITCH_SENSOR');

    externalSwitchSensor.getCharacteristic(this.platform.Characteristic.MotionDetected)
      .onGet(this.getExternalSwitch.bind(this));

    // Init Duka Comms
    this.client = new DukaSmartFanClient(this.device);
  }

  async getActive(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get status', this.device.deviceId);
    return this.client
      .getStatus()
      .then((status) => {
        this.platform.log.debug('[%s] Status:', this.device.deviceId, status);
        return status.active;
      })
      .catch(this.handleError.bind(this));
  }

  async setActive(value: CharacteristicValue) {
    this.platform.log.debug('[%s] Turn on/off ->', this.device.deviceId, value);
    return this.client
      .turnOnOff(<UnitOnOff>value)
      .then((active) => this.platform.log.debug('[%s] Turned on/off:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  async getBoostOnOff(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get boost status', this.device.deviceId);
    return this.client
      .getStatus()
      .then((status) => {
        this.platform.log.debug('[%s] Status:', this.device.deviceId, status);
        return status.boost;
      })
      .catch(this.handleError.bind(this));
  }

  async setBoost(value: CharacteristicValue) {
    this.platform.log.debug('[%s] Turn boost on/off ->', this.device.deviceId, value);
    return this.client
      .turnBoostOnOff(<UnitOnOff>value)
      .then((active) => this.platform.log.debug('[%s] Turned on/off:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  async getExternalSwitch(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get external switch status', this.device.deviceId);
    return this.client
      .getTriggerStatus()
      .then((status) => {
        this.platform.log.debug('[%s] Status:', this.device.deviceId, status);
        return status.externalSwitchSensor;
      })
      .catch(this.handleError.bind(this));
  }

  private handleError(error: Error): Promise<CharacteristicValue> {
    this.platform.log.error('[%s] Client error:', this.device.deviceId, error.message);
    throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.OPERATION_TIMED_OUT);
  }
}

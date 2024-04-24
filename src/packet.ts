import { TextDecoder, TextEncoder } from 'util';

const MAX_PACKET_SIZE = 256;
const PACKET_START = 0xfd;
const PROTOCOL_TYPE = 0x02;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export class Packet {
  constructor(
    public readonly deviceId: string,
    public readonly password: string,
    public readonly func: FuncType,
    public readonly data: DataBlock[]
  ) {}

  public toBytes(): Uint8Array {
    const bytes = new Uint8Array(MAX_PACKET_SIZE);
    let i = 0;

    // Header
    bytes[i++] = PACKET_START;
    bytes[i++] = PACKET_START;
    bytes[i++] = PROTOCOL_TYPE;

    // Device ID
    bytes[i++] = this.deviceId.length;
    bytes.set(TEXT_ENCODER.encode(this.deviceId), i);
    i += this.deviceId.length;

    // Password
    bytes[i++] = this.password.length;
    bytes.set(TEXT_ENCODER.encode(this.password), i);
    i += this.password.length;

    // Function
    bytes[i++] = this.func;

    // Data
    this.data.forEach((dataBlock) => {
      bytes[i++] = dataBlock.parameter;
      if (this.func === FuncType.WRITE) {
        bytes[i++] = dataBlock.value!;
      }
    });

    // Checksum
    bytes.set(Packet.checksum(bytes.subarray(2, i)), i);
    return bytes.subarray(0, i + 2);
  }

  public static fromBytes(bytes: Uint8Array): Packet {
    let i = 0;

    // Header
    if (bytes[i++] !== PACKET_START || bytes[i++] !== PACKET_START || bytes[i++] !== PROTOCOL_TYPE) {
      throw new Error('Invalid packet header: ' + bytes.subarray(0, 3));
    }

    // Device ID
    const deviceIdSize = bytes[i++];
    const deviceId = TEXT_DECODER.decode(bytes.subarray(i, i + deviceIdSize));
    i += deviceIdSize;

    // Password
    const passwordSize = bytes[i++];
    const password = TEXT_DECODER.decode(bytes.subarray(i, i + passwordSize));
    i += passwordSize;

    // Function
    if (bytes[i++] !== FuncType.RESPONSE) {
      throw new Error('Invalid packet function: ' + bytes[i - 1]);
    }

    // Data
    const dataBlocks = new Array((bytes.length - i - 2) / 2);
    for (let j = 0; j < dataBlocks.length; j++) {
      dataBlocks[j] = new DataBlock(bytes[i++], bytes[i++]);
    }

    // Checksum
    const calculated = Packet.checksum(bytes.subarray(2, i));
    const actual = [bytes[i++], bytes[i++]];
    if (calculated[0] !== actual[0] || calculated[1] !== actual[1]) {
      throw new Error('Invalid packet checksum. Expected: ' + calculated + '. Actual: ' + actual);
    }

    return new Packet(deviceId, password, FuncType.RESPONSE, dataBlocks);
  }

  private static checksum(bytes: Uint8Array): number[] {
    let checksum = 0;
    bytes.forEach((b) => (checksum += b));
    checksum = checksum & 0xffff;
    return [checksum & 0xff, checksum >> 8];
  }
}

export enum FuncType {
  READ = 0x01,
  WRITE = 0x03,
  RESPONSE = 0x06,
}

export enum Parameter {
  UNIT_ON_OFF = 0x0001, // R/W/RW - Fan On/Off
  BATTERY_STATUS = 0x0002, // R - Battery status
  HOURS_24_MODE_SELECTION = 0x0003, // R/W/RW - 24 hours mode selection
  CURRENT_FAN_SPEED = 0x0004, // R - Current fan speed (rpm)
  BOOST_ON_OFF = 0x0005, // R/W/RW - BOOST mode On/Off
  BOOST_TIMER = 0x0006, // R - Current BOOST timer countdown in seconds
  BUILT_IN_TIMER_STATUS = 0x0007, // R - Current status of the built-in timer
  HUMIDITY_SENSOR_OPERATION = 0x0008, // R - Current status of fan operation by humidity sensor
  TEMPERATURE_SENSOR_OPERATION = 0x000a, // R - Current status of fan operation by temperature sensor
  MOTION_SENSOR_OPERATION = 0x000b, // R - Current status of fan operation by motion sensor
  EXTERNAL_SWITCH_OPERATION = 0x000c, // R - Current status of fan operation by signal from an external switch
  INTERVAL_VENTILATION_MODE = 0x000d, // R - Current status of fan operation in interval ventilation mode
  SILENT_MODE_OPERATION = 0x000e, // R - Current status of fan operation in SILENT mode
  HUMIDITY_SENSOR_PERMISSION = 0x000f, // R/W/RW - Permission of operation based on humidity sensor readings
  TEMPERATURE_SENSOR_PERMISSION = 0x0011, // R/W/RW - Permission of operation based on temperature sensor readings
  MOTION_SENSOR_PERMISSION = 0x0012, // R/W/RW - Permission of operation based on motion sensor readings
  EXTERNAL_SWITCH_PERMISSION = 0x0013, // R/W/RW - Permission of operation based on signal from an external switch
  MAX_SPEED_SETPOINT = 0x0018, // R/W/RW/INC/DEC - Max speed setpoint
  SILENT_SPEED_SETPOINT = 0x001a, // R/W/RW/INC/DEC - Silent speed setpoint
  INTERVAL_VENTILATION_SPEED_SETPOINT = 0x001b, // R/W/RW/INC/DEC - Interval ventilation speed setpoint
  INTERVAL_VENTILATION_ACTIVATION = 0x001d, // R/W/RW - Interval ventilation mode activation
  SILENT_MODE_ACTIVATION = 0x001e, // R/W/RW - Silent mode activation
  SILENT_MODE_START_TIME = 0x001f, // R/W/RW - Silent Mode start time in seconds
  SILENT_MODE_END_TIME = 0x0020, // R/W/RW - Silent Mode end time in seconds
  CURRENT_TIME_INTERNAL_CLOCK = 0x0021, // R/W/RW - Current time of the fan internal clock in seconds
  TURN_OFF_DELAY_TIMER = 0x0023, // R/W/RW/INC/DEC - Turn-off delay timer/BOOST setpoint
  TURN_ON_DELAY_TIMER = 0x0024, // R/W/RW/INC/DEC - Turn-on delay timer setpoint
  RESET_TO_FACTORY_SETTINGS = 0x0025, // W - Resetting parameters to factory settings
  DEVICE_SEARCH_LOCAL_NETWORK = 0x007c, // R - Device search on the local Ethernet network
  BASE_FIRMWARE_VERSION = 0x0086, // R - Controller base firmware version and date
  WIFI_OPERATION_MODE = 0x0094, // R/W/RW - Wi-Fi operation mode
  WIFI_CLIENT_MODE_NAME = 0x0095, // R/W/RW - Wi-Fi name in Client mode
  WIFI_PASSWORD = 0x0096, // R/W/RW - Wi-Fi password
  WIFI_ENCRYPTION_TYPE = 0x0099, // R/W/RW - Wi-Fi data encryption type
  WIFI_FREQUENCY_CHANNEL = 0x009a, // R/W/RW - Wi-Fi frequency channel
  WIFI_DHCP_MODE = 0x009b, // R/W/RW - Wi-Fi module DHCP
  WIFI_IP_ADDRESS = 0x009c, // R/W/RW - IP address assigned to Wi-Fi module
  WIFI_SUBNET_MASK = 0x009d, // R/W/RW - Wi-Fi module subnet mask
  WIFI_GATEWAY = 0x009e, // R/W/RW - Wi-Fi module main gateway
  APPLY_WIFI_SETTINGS = 0x00a0, // W - Apply new Wi-Fi parameters and quit Wi-Fi module Setup Mode
  CURRENT_WIFI_IP_ADDRESS = 0x00a3, // R - Current Wi-Fi module IP address
  UNIT_TYPE = 0x00b9, // R - Unit type
}

export enum UnitOnOff {
  ON = 1,
  OFF = 0,
}

export class DataBlock {
  constructor(public readonly parameter: Parameter, public readonly value?: number) {}
}

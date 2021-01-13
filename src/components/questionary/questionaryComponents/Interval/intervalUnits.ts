export enum IntervalPropertyId {
  ACCELERATION = 'ACCELERATION',
  AMOUNT_OF_SUBSTANCE = 'AMOUNT_OF_SUBSTANCE',
  ANGLE = 'ANGLE',
  ANGULAR_VELOCITY = 'ANGULAR_VELOCITY',
  AREA = 'AREA',
  CAPACITANCE = 'CAPACITANCE',
  ELECTRIC_CHARGE = 'ELECTRIC_CHARGE',
  ELECTRIC_CONDUCTANCE = 'ELECTRIC_CONDUCTANCE',
  ELECTRIC_CURRENT = 'ELECTRIC_CURRENT',
  ELECTRIC_POTENTIAL_DIFFERENCE = 'ELECTRIC_POTENTIAL_DIFFERENCE',
  ELECTRIC_RESISTANCE = 'ELECTRIC_RESISTANCE',
  ENERGY = 'ENERGY',
  FORCE = 'FORCE',
  FREQUENCY = 'FREQUENCY',
  INDUCTANCE = 'INDUCTANCE',
  INFORMATION = 'INFORMATION',
  INFORMATION_RATE = 'INFORMATION_RATE',
  LENGTH = 'LENGTH',
  LUMINANCE = 'LUMINANCE',
  MAGNETIC_FIELD = 'MAGNETIC_FIELD',
  MAGNETIC_FLUX = 'MAGNETIC_FLUX',
  MAGNETIC_FLUX_DENSITY = 'MAGNETIC_FLUX_DENSITY',
  MASS = 'MASS',
  MASS_DENSITY = 'MASS_DENSITY',
  POWER = 'POWER',
  PRESSURE = 'PRESSURE',
  RATIO = 'RATIO',
  SPEED = 'SPEED',
  SURFACE_TENSION = 'SURFACE_TENSION',
  TEMPERATURE = 'TEMPERATURE',
  TIME = 'TIME',
  UNITLESS = 'UNITLESS',
  VOLUME = 'VOLUME',
  MASS_VOLUME = 'MASS_VOLUME',
}

export interface IntervalProperty {
  id: IntervalPropertyId;
  name: string;
  siUnit: string | null;
  units: string[];
}

const propertyList = new Map<IntervalPropertyId, IntervalProperty>();
propertyList.set(IntervalPropertyId.LENGTH, {
  id: IntervalPropertyId.LENGTH,
  name: 'length',
  siUnit: 'meter',
  units: [
    'kilometer',
    'meter',
    'decimeter',
    'centimeter',
    'millimeter',
    'mikrometer',
    'nanometer',
    'angstrom',
    'pikometer',
    'femtometer',
    'attometer',
    'zeptometer',
    'yoctometer',
  ],
});
propertyList.set(IntervalPropertyId.MASS, {
  id: IntervalPropertyId.MASS,
  name: 'mass',
  siUnit: 'kilogram',
  units: ['kilogram', 'milligram', 'centigram', 'decigram', 'gram'],
});
propertyList.set(IntervalPropertyId.TIME, {
  id: IntervalPropertyId.TIME,
  name: 'time',
  siUnit: 'second',
  units: [
    'planck time unit',
    'yoctosecond',
    'zeptosecond',
    'attosecond',
    'femtosecond',
    'picosecond',
    'nanosecond',
    'microsecond',
    'millisecond',
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'semester',
    'year',
  ],
});
propertyList.set(IntervalPropertyId.ELECTRIC_CURRENT, {
  id: IntervalPropertyId.ELECTRIC_CURRENT,
  name: 'electric current',
  siUnit: 'ampere',
  units: [
    'kiloampere',
    'ampere',
    'milliampere',
    'microampere',
    'nanoampere',
    'planck current',
  ],
});
propertyList.set(IntervalPropertyId.TEMPERATURE, {
  id: IntervalPropertyId.TEMPERATURE,
  name: 'temperature',
  siUnit: 'kelvin',
  units: [
    'kelvin',
    'millikelvin',
    'microkelvin',
    'nanokelvin',
    'picokelvin',
    'celsius',
    'fahrenheit',
  ],
});
propertyList.set(IntervalPropertyId.AMOUNT_OF_SUBSTANCE, {
  id: IntervalPropertyId.AMOUNT_OF_SUBSTANCE,
  name: 'amount of substance',
  siUnit: 'mole',
  units: ['mol'],
});
propertyList.set(IntervalPropertyId.AREA, {
  id: IntervalPropertyId.AREA,
  name: 'area',
  siUnit: 'square meter',
  units: [
    'meter^2',
    'decimeter^2',
    'centimeter^2',
    'millimeter^2',
    'mikrometer^2',
    'nanometer^2',
    'angstrom^2',
    'pikometer^2',
    'femtometer^2',
    'attometer^2',
    'zeptometer^2',
    'yoctometer^2',
  ],
});
propertyList.set(IntervalPropertyId.VOLUME, {
  id: IntervalPropertyId.VOLUME,
  name: 'volume',
  siUnit: 'cubic meter',
  units: [
    'meter^3',
    'decimeter^3',
    'centimeter^3',
    'millimeter^3',
    'mikrometer^3',
    'nanometer^3',
    'angstrom^3',
    'pikometer^3',
    'femtometer^3',
    'attometer^3',
    'zeptometer^3',
    'yoctometer^3',
  ],
});
propertyList.set(IntervalPropertyId.SPEED, {
  id: IntervalPropertyId.SPEED,
  name: 'speed, velocity',
  siUnit: 'meter/second',
  units: [
    'kilometer/second',
    'meter/second',
    'millimeter/second',
    'micrometer/second',
    'nanometer/second',
    'picometer/second',
    'kmh',
    'mph',
  ],
});
propertyList.set(IntervalPropertyId.ACCELERATION, {
  id: IntervalPropertyId.ACCELERATION,
  name: 'acceleration',
  siUnit: 'meter/second^2',
  units: [
    'kilometer/second^2',
    'meter/second^2',
    'millimeter/second^2',
    'micrometer/second^2',
    'nanometer/second^2',
    'picometer/second^2',
  ],
});
propertyList.set(IntervalPropertyId.MASS_DENSITY, {
  id: IntervalPropertyId.MASS_DENSITY,
  name: 'density',
  siUnit: 'kilogram/meter^3',
  units: [
    'kilogram/meter^3',
    'gram/meter^3',
    'milligram/meter^3',
    'kilogram/liter',
    'gram/liter',
    'milligram/liter',
  ],
});
propertyList.set(IntervalPropertyId.MAGNETIC_FIELD, {
  id: IntervalPropertyId.MAGNETIC_FIELD,
  name: 'magnetic field strength',
  siUnit: 'ampere/meter',
  units: ['ampere/meter', 'milliampere/meter', 'ampere/milimeter', 'gauss'],
});
propertyList.set(IntervalPropertyId.LUMINANCE, {
  id: IntervalPropertyId.LUMINANCE,
  name: 'luminance',
  siUnit: 'candela',
  units: [
    'teracandela',
    'gigacandela',
    'megacandela',
    'kilocandela',
    'candela',
    'millicandela',
    'microcandela',
    'nanocandela',
    'picocandela',
  ],
});
propertyList.set(IntervalPropertyId.ANGLE, {
  id: IntervalPropertyId.ANGLE,
  name: 'angle',
  siUnit: 'radian',
  units: ['degree', 'arcsecond', 'radian', 'gradian'],
});
propertyList.set(IntervalPropertyId.FREQUENCY, {
  id: IntervalPropertyId.FREQUENCY,
  name: 'frequency',
  siUnit: 'hertz',
  units: [
    'terahertz',
    'gigahertz',
    'megahertz',
    'kilohertz',
    'hertz',
    'millihertz',
    'microhertz',
    'nanohertz',
    'picohertz',
  ],
});
propertyList.set(IntervalPropertyId.FORCE, {
  id: IntervalPropertyId.FORCE,
  name: 'force',
  siUnit: 'newton',
  units: [
    'teranewton',
    'giganewton',
    'meganewton',
    'kilonewton',
    'newton',
    'millinewton',
    'micronewton',
    'nanonewton',
    'piconewton',
  ],
});
propertyList.set(IntervalPropertyId.PRESSURE, {
  id: IntervalPropertyId.PRESSURE,
  name: 'pressure, stress',
  siUnit: 'pascal',
  units: [
    'pascal',
    'milipascal',
    'bar',
    'technical atmosphere',
    'standard atmosphere',
    'torr',
  ],
});
propertyList.set(IntervalPropertyId.ENERGY, {
  id: IntervalPropertyId.ENERGY,
  name: 'energy, work, quantity of heat',
  siUnit: 'joule',
  units: [
    'terajoule',
    'gigajoule',
    'megajoule',
    'kilojoule',
    'joule',
    'millijoule',
    'microjoule',
    'nanojoule',
    'picojoule',
    'btu',
    'calorie',
    'Calorie',
    'electronvolt',
    'megaelectronvolt',
  ],
});
propertyList.set(IntervalPropertyId.POWER, {
  id: IntervalPropertyId.POWER,
  name: 'power, radiant flux',
  siUnit: 'watt',
  units: [
    'gigawatt',
    'megawatt',
    'kilowatt',
    'watt',
    'milliwatt',
    'microwatt',
    'nanowatt',
    'horsepower',
    'volt-ampere',
  ],
});
propertyList.set(IntervalPropertyId.ELECTRIC_CHARGE, {
  id: IntervalPropertyId.ELECTRIC_CHARGE,
  name: 'electric charge,  quantity of electricity',
  siUnit: 'coulomb',
  units: [
    'coulomb',
    'millicoulomb',
    'microcoulomb',
    'nanocoulomb',
    'ampere-hour',
    'miliampere-hour',
  ],
});
propertyList.set(IntervalPropertyId.ELECTRIC_POTENTIAL_DIFFERENCE, {
  id: IntervalPropertyId.ELECTRIC_POTENTIAL_DIFFERENCE,
  name: 'electric potential difference',
  siUnit: 'volt',
  units: [
    'gigavolt',
    'megavolt',
    'kilovolt',
    'volt',
    'millivolt',
    'microvolt',
    'nanovolt',
  ],
});
propertyList.set(IntervalPropertyId.CAPACITANCE, {
  id: IntervalPropertyId.CAPACITANCE,
  name: 'capacitance',
  siUnit: 'farad',
  units: [
    'megafarad',
    'kilofarad',
    'farad',
    'millifarad',
    'microfarad',
    'nanofarad',
  ],
});
propertyList.set(IntervalPropertyId.ELECTRIC_RESISTANCE, {
  id: IntervalPropertyId.ELECTRIC_RESISTANCE,
  name: 'electric resistance',
  siUnit: 'ohm',
  units: ['gigaohm', 'megaohm', 'kiloohm', 'ohm', 'milliohm', 'microohm'],
});
propertyList.set(IntervalPropertyId.MAGNETIC_FLUX, {
  id: IntervalPropertyId.MAGNETIC_FLUX,
  name: 'magnetic flux',
  siUnit: 'weber',
  units: [
    'megaweber',
    'kiloweber',
    'weber',
    'milliweber',
    'microweber',
    'nanoweber',
    'line',
  ],
});
propertyList.set(IntervalPropertyId.MAGNETIC_FLUX_DENSITY, {
  id: IntervalPropertyId.MAGNETIC_FLUX_DENSITY,
  name: 'magnetic flux density',
  siUnit: 'tesla',
  units: [
    'gigatesla',
    'megatesla',
    'kilotesla',
    'tesla',
    'millitesla',
    'microtesla',
    'nanotesla',
  ],
});
propertyList.set(IntervalPropertyId.INDUCTANCE, {
  id: IntervalPropertyId.INDUCTANCE,
  name: 'inductance',
  siUnit: 'henry',
  units: ['megahenry', 'kilohenry', 'henry', 'millihenry', 'microhenry'],
});
propertyList.set(IntervalPropertyId.SURFACE_TENSION, {
  id: IntervalPropertyId.SURFACE_TENSION,
  name: 'surface tension',
  siUnit: 'newton per meter',
  units: ['newton/meter'],
});
propertyList.set(IntervalPropertyId.ANGULAR_VELOCITY, {
  id: IntervalPropertyId.ANGULAR_VELOCITY,
  name: 'angular velocity',
  siUnit: 'radian per second',
  units: [
    'radian/second',
    'degree/second',
    'radian/minute',
    'degree/minute',
    'radian/hour',
    'degree/hour',
  ],
});
propertyList.set(IntervalPropertyId.RATIO, {
  id: IntervalPropertyId.RATIO,
  name: 'ratio',
  siUnit: null,
  units: ['%', '‰'],
});
propertyList.set(IntervalPropertyId.INFORMATION, {
  id: IntervalPropertyId.INFORMATION,
  name: 'information',
  siUnit: null,
  units: ['bit', 'byte', 'megabyte', 'gigabyte', 'terabyte'],
});

propertyList.set(IntervalPropertyId.INFORMATION_RATE, {
  id: IntervalPropertyId.INFORMATION_RATE,
  name: 'information speed',
  siUnit: null,
  units: ['bit/second', 'byte/second', 'megabyte/second', 'gigabyte/second'],
});

propertyList.set(IntervalPropertyId.MASS_VOLUME, {
  id: IntervalPropertyId.MASS_VOLUME,
  name: 'mass and volume',
  siUnit: null,
  units: ['µg', 'mg', 'g', 'kg', 'µL', 'mL', 'L'],
});

propertyList.set(IntervalPropertyId.UNITLESS, {
  id: IntervalPropertyId.UNITLESS,
  name: 'No unit',
  siUnit: null,
  units: [],
});

const allProperties = new Map(Array.from(propertyList.entries()).sort());

export { allProperties };

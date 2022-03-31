DO $DO$ BEGIN IF register_patch(
  'CreateQuantitiesTable.sql',
  'Jekabs Karklins',
  'Create quantities table',
  '2022-01-05'
) THEN BEGIN 


CREATE TABLE quantities (
  quantity_id varchar(255) NOT NULL,
  CONSTRAINT quantities_pkey PRIMARY KEY (quantity_id)
);

INSERT INTO 
  quantities (quantity_id) 
VALUES 
  ('length'),
  ('mass'),
  ('time'),
  ('electric current'),
  ('thermodynamic temperature'),
  ('amount of substance'),
  ('luminous intensity'),
  ('area'),
  ('volume'),
  ('speed, velocity'),
  ('acceleration'),
  ('mass density'),
  ('magnetic field strength'),
  ('concentration'),
  ('luminance'),
  ('angle'),
  ('frequency'),
  ('force'),
  ('pressure, stress'),
  ('energy, work, quantity of heat'),
  ('power radiant flux'),
  ('electric charge, quantity of electricity'),
  ('electromotive force'),
  ('capacitance'),
  ('electric resistance'),
  ('electric conductance'),
  ('magnetic flux'),
  ('magnetic flux density'),
  ('inductance'),
  ('luminous flux'),
  ('illuminance'),
  ('surface tension'),
  ('angular velocity'),
  ('angular acceleration'),
  ('heat flux density, irradiance'),
  ('heat capacity, entropy'),
  ('specific energy'),
  ('thermal conductivity'),
  ('energy density'),
  ('electric field strength'),
  ('electric charge density'),
  ('electric flux density'),
  ('permittivity'),
  ('permeability'),
  ('molar energy'),
  ('molar entropy, molar heat capacity'),
  ('exposure (x and gamma rays)'),
  ('absorbed dose rate'),
  ('radiant intensity'),
  ('radiance'),
  ('dose equivalent'),
  ('activity (of a radionuclide)'),
  ('absorbed dose, specific energy (imparted), kerma'),
  ('catalytic (activity) concentration');


ALTER TABLE units
RENAME TO units_backup;


CREATE TABLE units (
    unit_id  varchar(255) PRIMARY KEY
  , unit varchar(255) NOT NULL
  , quantity varchar(255) NOT NULL REFERENCES quantities(quantity_id)
  , symbol varchar(255) DEFAULT ''
  , si_conversion_formula varchar(255) DEFAULT 'x'
);


INSERT INTO units (unit_id, unit, quantity, symbol, si_conversion_formula)
SELECT unit, unit, 'mass', '', 'x'
FROM units_backup;

DROP TABLE units_backup;

INSERT INTO units (unit_id, quantity, unit, symbol)
VALUES ('length', 'length', 'meter', 'm'),
  ('mass', 'mass', 'kilogram', 'kg'),
  ('time', 'time', 'second', 's'),
  ('electric_current', 'electric current', 'ampere', 'A'),
  (
    'temperature',
    'thermodynamic temperature',
    'kelvin',
    'K'
  ),
  (
    'amount_of_substance',
    'amount of substance',
    'mole',
    'mol'
  ),
  (
    'luminous_intensity',
    'luminous intensity',
    'candela',
    'cd'
  ),
  ('area', 'area', 'square meter', 'm2'),
  ('volume', 'volume', 'cubic meter', 'm3'),
  (
    'speed',
    'speed, velocity',
    'meter per second',
    'm/s'
  ),
  (
    'acceleration',
    'acceleration',
    'meter per second squared',
    'm/s2'
  ),
  (
    'mass_density',
    'mass density',
    'kilogram per cubic meter',
    'kg/m3'
  ),
  (
    'magnetic_field_strength',
    'magnetic field strength',
    'ampere per meter',
    'A/m'
  ),
  (
    'concentration',
    'concentration',
    'mole per cubic meter',
    'mol/m3'
  ),
  (
    'luminance',
    'luminance',
    'candela per square meter',
    'cd/m2'
  ),
  ('angle', 'angle', 'radian (a)', 'rad'),
  ('frequency', 'frequency', 'hertz', 'Hz'),
  ('force', 'force', 'newton', 'N'),
  ('pressure', 'pressure, stress', 'pascal', 'Pa'),
  (
    'energy',
    'energy, work, quantity of heat',
    'joule',
    'J'
  ),
  ('power', 'power radiant flux', 'watt', 'W'),
  (
    'electricity_quantity',
    'electric charge, quantity of electricity',
    'coulomb',
    'C'
  ),
  (
    'electromotive_force',
    'electromotive force',
    'volt',
    'V'
  ),
  ('capacitance', 'capacitance', 'farad', 'F'),
  (
    'electric_resistance',
    'electric resistance',
    'ohm',
    'Ω'
  ),
  (
    'electric_conductance',
    'electric conductance',
    'siemens',
    'S'
  ),
  ('magnetic_flux', 'magnetic flux', 'weber', 'Wb'),
  (
    'magnetic_flux_density',
    'magnetic flux density',
    'tesla',
    'T'
  ),
  ('inductance', 'inductance', 'henry', 'H'),
  ('luminous_flux', 'luminous flux', 'lumen', 'lm'),
  ('illuminance', 'illuminance', 'lux', 'lx'),
  (
    'surface_tension',
    'surface tension',
    'newton per meter',
    'N/m'
  ),
  (
    'angular_velocity',
    'angular velocity',
    'radian per second',
    'rad/s'
  ),
  (
    'angular_acceleration',
    'angular acceleration',
    'radian per second squared',
    'rad/s2'
  ),
  (
    'irradiance',
    'heat flux density, irradiance',
    'watt per square meter',
    'W/m2'
  ),
  (
    'heat_capacity',
    'heat capacity, entropy',
    'joule per kelvin',
    'J/K'
  ),
  (
    'specific_energy',
    'specific energy',
    'joule per kilogram',
    'J/kg'
  ),
  (
    'thermal_conductivity',
    'thermal conductivity',
    'watt per meter kelvin',
    'W/(m·K)'
  ),
  (
    'energy_density',
    'energy density',
    'joule per cubic meter',
    'J/m3'
  ),
  (
    'electric_field_strength',
    'electric field strength',
    'volt per meter',
    'V/m'
  ),
  (
    'elecelectric_charge_densitytric',
    'electric charge density',
    'coulomb per cubic meter',
    'C/m3'
  ),
  (
    'electric_flux_density',
    'electric flux density',
    'coulomb per square meter',
    'C/m2'
  ),
  (
    'permittivity',
    'permittivity',
    'farad per meter',
    'F/m'
  ),
  (
    'permeability',
    'permeability',
    'henry per meter',
    'H/m'
  ),
  (
    'molar_energy',
    'molar energy',
    'joule per mole',
    'J/mol'
  ),
  (
    'molar_entropy',
    'molar entropy, molar heat capacity',
    'joule per mole kelvin',
    'J/(mol·K)'
  ),
  (
    'exposure',
    'exposure (x and gamma rays)',
    'coulomb per kilogram',
    'C/kg'
  ),
  (
    'absorbed_dose_rate',
    'absorbed dose rate',
    'gray per second',
    'Gy/s'
  ),
  (
    'radiant_intensity',
    'radiant intensity',
    'watt per steradian',
    'W/sr'
  ),
  (
    'radiance',
    'radiance',
    'watt per square meter steradian',
    'W/(m2·sr)'
  ),
  (
    'sievert',
    'dose equivalent',
    'sievert',
    'Sv'
  ),
  (
    'becquerel',
    'activity (of a radionuclide)',
    'becquerel',
    'Bq'
  ),
   (
    'gray',
    'absorbed dose, specific energy (imparted), kerma',
    'gray',
    'Gy'
  ),
  (
    'catalytic_concentration',
    'catalytic (activity) concentration',
    'katal per cubic meter',
    'kat/m3'
  );

END;
END IF;
END;
$DO$ LANGUAGE plpgsql;
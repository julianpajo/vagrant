# Documentation of already implemented algorithms

## • index_cglc_flow

Executes the sequence of tasks necessary for generating and indexing
    Copernicus Global Land Cover data

#### Parameters:
- `years`: List[int], years on which the indexing takes place
- `feature_collection`: __geo_interface__, an area of interest where running the indexing

## • index_gpcc_global_precipitation_flow

Executes the sequence of tasks necessary for generating and indexing
    CRU_TS_MEAN_TEMPERATURE data

#### Parameters:
- `years_range`: integer default = 30 it used for set the range of the years
- `end_year`: end_year to set the indexing range [end_year - 30, end_year]

#### Return:
the first and last tasks results, in order to control execution ordering
             within a flow

## • index_aboveground_live_woody_biomass_density_flow

Executes the sequence of tasks necessary for generating and indexing
    Aboveground Live Woody Biomass Density data

#### Parameters:
- `feature_collection`: __geo_interface__, an area of interest where running the indexing

#### Return:
the first and last tasks results, in order to control execution ordering
             within a flow

## • index_forest_greenhouse_gas_emissions_flow

Executes the sequence of tasks necessary for generating and indexing
    Forest Greenhouse Gas Emissions data

#### Parameters:
- `feature_collection`: __geo_interface__, an area of interest where running the indexing

#### Return:
the first and last tasks results, in order to control execution ordering
             within a flow

## • index_forest_carbon_removals_flow

Executes the sequence of tasks necessary for generating and indexing
    Forest Carbon Removals data

#### Parameters:
- `feature_collection`: __geo_interface__, an area of interest where running the indexing

#### Return:
the first and last tasks results, in order to control execution ordering
             within a flow

## • index_modis_lc_flow

Executes the sequence of tasks necessary for generating and indexing
    MODIS MCD12Q1 data

#### Parameters:
- `years`: List[int], years on which the indexing takes place
- `feature_collection`: __geo_interface__, an area of interest where running the indexing

## • index_cru_ts_mean_temperature_flow

Executes the sequence of tasks necessary for generating and indexing
    CRU_TS_MEAN_TEMPERATURE data

#### Parameters:
- `years_range`: integer default = 30 it used for set the range of the years
- `end_year`: end_year to set the indexing range [end_year - 30, end_year]

#### Return:
the first and last tasks results, in order to control execution ordering
             within a flow


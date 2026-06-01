const PRESTIGE_CONFIG = {
    modules: {
        atmospheric_separator: {
            name: 'Atmospheric Separator',
            produces: ['hydrogen', 'oxygen'],
            blueprintCost: 1
        },
        carbon_scrubber: {
            name: 'Carbon Scrubber',
            produces: ['carbon'],
            blueprintCost: 1
        },
        nitrogen_condenser: {
            name: 'Nitrogen Condenser',
            produces: ['nitrogen'],
            blueprintCost: 1
        },
        iron_smelter: {
            name: 'Iron Smelter',
            produces: ['iron'],
            blueprintCost: 1
        },
        sulfur_extractor: {
            name: 'Sulfur Extractor',
            produces: ['sulfur'],
            blueprintCost: 1
        }
    }
};

module.exports = PRESTIGE_CONFIG;

/*
 * "Virtual" object just so we do not have to specify the delete() function every time.
 * Mind that there is no LLKAObject actually defined by the ReDNATCO backend library
 */
export declare class LLKAObject {
    delete(): void;
}

export declare class LLKAVector<T> extends LLKAObject {
    get(idx: number): T;
    push_back(element: T): void;
    resize(size: number): void;
    set(idx: number, element: T): void
    size(): number;
}

export declare class LLKAMap<K, V> extends LLKAObject {
    get(key: K): V
    keys(): LLKAVector<K>;
    set(key: K, value: V): void;
    size(): number;
}

export type NtC = number;
export type CANA = number;
export type CifDataValueState = number;
export type CrossResidueMetric = number;
export type DinucleotideTorsion = number;
export type RetCode = number;
export type SugarPucker = number;

/*
 * =====================
 *    Structure types
 * =====================
 */


export type LLKAPoint = {
    x: number;
    y: number;
    z: number;
};
export type LLKAPoints = LLKAVector<LLKAPoint>;


export type LLKAAtom = {
    type_symbol: string;
    label_atom_id: string;
    label_entity_id: string;
    label_comp_id: string;
    label_asym_id: string;
    auth_atom_id: string;
    auth_comp_id: string;
    auth_asym_id: string;
    coords: LLKAPoint;
    id: number;
    label_seq_id: number;
    auth_seq_id: number;
    pdbx_PDB_model_num: number;
    pdbx_PDB_ins_code: string;
    label_alt_id: number;
};
export type LLKAStructure = LLKAVector<LLKAAtom>;
export type LLKAStructures = LLKAVector<LLKAStructure>;

export declare class LLKAAtomNameQuad extends LLKAObject {
    a: string;
    b: string;
    c: string;
    d: string;
}

/**
 * ==================
 *    Segmentation
 * ==================
 */

export type StructureSegmentationResidue = {
    atoms: LLKAStructure;
};
export type StructureSegmentationResidues = LLKAMap<number, StructureSegmentationResidue>;

export type StructureSegmentationChain = {
    residues: StructureSegmentationResidues;
};
export type StructureSegmentationChains = LLKAMap<string, StructureSegmentationChain>;

export type StructureSegmentationModel = {
    chain: StructureSegmentationChains;
}
export type StructureSegmentationModels = LLKAMap<number, StructureSegmentationModel>;

export type StructureSegmentation = {
    models: StructureSegmentationModels;
    structure: LLKAStructure;
};


export type LLKAStepMetrics = {
    delta_1: number;
    epsilon_1: number;
    zeta_1: number;
    alpha_2: number;
    beta_2: number;
    gamma_2: number;
    delta_2: number;
    chi_1: number;
    chi_2: number;
    CC: number;
    NN: number;
    mu: number;
};

/**
 * ===================================
 *    Connectivity/similarity types
 * ===================================
 */

export type  LLKAConnectivity = {
    C5PrimeDistance: number;
    O3PrimeDistance: number;
};
export type LLKAConnectivities = LLKAVector<LLKAConnectivity>;

export type LLKASimilarity = {
    rmsd: number;
    euclideanDistance: number;
};
export type LLKASimilarities = LLKAVector<LLKASimilarity>;

/*
 * ==========================
 *    Classification types
 * ==========================
 */

export type LLKAClassificationMetric = {
    deviation: number;
    minValue: number;
    meanValue: number;
    maxValue: number;
};

export type LLKANuAnglesMetrics = {
    nu_0: LLKAClassificationMetric;
    nu_1: LLKAClassificationMetric;
    nu_2: LLKAClassificationMetric;
    nu_3: LLKAClassificationMetric;
    nu_4: LLKAClassificationMetric;
};

export type LLKAClassificationCluster = {
    delta_1: LLKAClassificationMetric;
    epsilon_1: LLKAClassificationMetric;
    zeta_1: LLKAClassificationMetric;
    alpha_2: LLKAClassificationMetric;
    beta_2: LLKAClassificationMetric;
    gamma_2: LLKAClassificationMetric;
    delta_2: LLKAClassificationMetric;
    chi_1: LLKAClassificationMetric;
    chi_2: LLKAClassificationMetric;
    CC: LLKAClassificationMetric;
    NN: LLKAClassificationMetric;
    mu: LLKAClassificationMetric;
    nusFirst: LLKANuAnglesMetrics;
    nusSecond: LLKANuAnglesMetrics;
    ribosePseudorotation_1: number;
    ribosePseudorotation_2: number;
    number: number;
    NtC: NtC;
    CANA: CANA;
};

export declare class LLKAClassificationContext {
}

export type LLKAClassificationLimits = {
    minimumNearestNeighbors: number;
    numberOfUsedNearestNeighbors: number;
    averageNeighborsTorsionCutoff: number;
    nearestNeighborTorsionsCutoff: number;
    totalDistanceCutoff: number;
    pseudorotationCutoff: number;
    minimumClusterVotes: number;
};

export type LLKAConfal = {
    delta_1: number;
    epsilon_1: number;
    zeta_1: number;
    alpha_2: number;
    beta_2: number;
    gamma_2: number;
    delta_2: number;
    chi_1: number;
    chi_2: number;
    CC: number;
    NN: number;
    mu: number;
    nusFirst: LLKANuAngles;
    nusSecond: LLKANuAngles;
    clusterNumber: number;
};

export type LLKAConfalScore = {
    delta_1: number;
    epsilon_1: number;
    zeta_1: number;
    alpha_2: number;
    beta_2: number;
    gamma_2: number;
    delta_2: number;
    chi_1: number;
    chi_2: number;
    CC: number;
    NN: number;
    mu: number;
    total: number;
};

export type LLKANuAngles = {
    nu_0: number;
    nu_1: number;
    nu_2: number;
    nu_3: number;
    nu_4: number;
};

export declare class LLKAClassifiedStep extends LLKAObject {
    assignedNtC: NtC;
    assignedCANA: CANA;
    closestNtC: NtC;
    closestCANA: CANA;
    confalScore: LLKAConfalScore;
    euclideanDistanceNtCIdeal: number;
    metrics: LLKAStepMetrics;
    differencesFromNtCAverages: LLKAStepMetrics;
    nuAngles_1: LLKANuAngles;
    nuAngles_2: LLKANuAngles;
    ribosePseudorotation_1: number;
    ribosePseudorotation_2: number;
    tau_1: number;
    tau_2: number;
    sugarPucker_1: SugarPucker;
    sugarPucker_2: SugarPucker;
    nuAngleDifferences_1: LLKANuAngles;
    nuAngleDifferences_2: LLKANuAngles;
    rmsdToClosestNtC: number;
    closestGoldenStep: string;
    violations: number;
    violatingTorsionsAverage: number;
    violatingTorsionsNearest: number;

    hasViolations(): boolean;
    namedViolations(): string;
}

export type LLKAAttemptedClassifiedStep = {
    step: LLKAClassifiedStep;
    status: RetCode;
};
export type LLKAAttemptedClassifiedSteps  = LLKAVector<LLKAAttemptedClassifiedStep>;

export type LLKAAverageConfal = {
    score: number;
    percentile: number;
};


/*
 * ==========================
 *            CIF
 * ==========================
 */

export type LLKACifDataValue = {
    text: string;
    state: CifDataValueState;
}

export type LLKACifDataItem = {
    keyword: string;
    values: LLKACifDataValues;
};
export type LLKACifDataItems = LLKAVector<LLKACifDataItem>;

export type LLKACifDataValues = LLKAVector<LLKACifDataValue>;

export declare class LLKACifDataCategory extends LLKAObject {
    name: string;
    items: string;

    isLoop(): boolean;
}
export type LLKACifDataCategories = LLKAVector<LLKACifDataCategory>;

export type LLKACifDataBlock = {
    name: string;
    categories: LLKACifDataCategories;
};
export type CifBlocks = LLKAVector<LLKACifDataBlock>;

export type LLKACifData = {
    blocks: CifBlocks;
}


export type LLKACifError = {
    tRet: RetCode;
    error: string;
}

export type LLKAImportedStructure = {
    id: string;
    structure: LLKAStructure;
     cifData: LLKACifData;
};

export declare class LLKACifResult extends LLKAObject {
    failure(): LLKACifError;
    isSuccess(): boolean;
    success(): LLKAImportedStructure;
}

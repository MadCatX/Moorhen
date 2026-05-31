import * as LT from "../../types/llka";

declare global {
    function createLLKAModule(arg0: any): Promise<any>;
}

let LLKAInstance;
const loadLLKA = async () =>  {
    importScripts("/MoorhenAssets/wasm/libLLKA.js");
    return await createLLKAModule({ locateFile: (p) => "/MoorhenAssets/wasm/" + p });
}

const degToRad = (deg: number) => {
    return deg * 3.14159265 / 180.0;
}

let LLKAClassificationCtx: LT.LLKAClassificationContext;
const initializeLLKAClassificationContext = async () => {
    const ClassificationLimits: LT.LLKAClassificationLimits = {
        minimumNearestNeighbors: 7,
        numberOfUsedNearestNeighbors: 11,
        minimumClusterVotes: 0.001111,
        averageNeighborsTorsionCutoff: degToRad(28.0),
        nearestNeighborTorsionsCutoff: degToRad(28.0),
        totalDistanceCutoff: degToRad(60.0),
        pseudorotationCutoff: degToRad(72.0)
    };
    const MaxCloseEnoughRmsd = 0.5;

    const clusters = await (await fetch("/MoorhenAssets/llka/clusters.csv")).text();
    const confal_percentiles = await (await fetch("/MoorhenAssets/llka/confal_percentiles.csv")).text();
    const confals = await (await fetch("/MoorhenAssets/llka/confals.csv")).text();
    const golden_steps = await (await fetch("/MoorhenAssets/llka/golden_steps.csv")).text();
    const nu_angles = await (await fetch("/MoorhenAssets/llka/nu_angles.csv")).text();

    console.log(clusters);

    const resClusters = LLKAInstance.loadClusters(clusters);
    const resConfalPercentiles = LLKAInstance.loadConfalPercentiles(confal_percentiles);
    const resConfals = LLKAInstance.loadConfals(confals);
    const resGoldenSteps = LLKAInstance.loadGoldenSteps(golden_steps);
    const resNuAngles = LLKAInstance.loadClusterNuAngles(nu_angles);

    const ctxRes = LLKAInstance.initializeClassificationContext(
        resClusters.success(),
        resGoldenSteps.success(),
        resConfals.success(),
        resNuAngles.success(),
        resConfalPercentiles.success(),
        ClassificationLimits,
        MaxCloseEnoughRmsd,
    );

    if (!ctxRes.isSuccess()) {
        throw new Error(`Failed to initialize classification context: ${ctxRes.failure()}`);
    }

    return ctxRes.success();
}


/*
 * =====================
 *    Structure types
 * =====================
 */

const CLLKAPoint = (x: number, y: number, z: number) => {
    return { x: x, y: y, z: z };
}

const CLLKAAtom = (
    type_symbol: string,
    label_atom_id: string, label_entity_id: string, label_comp_id: string, label_asym_id: string,
    auth_atom_id: string, auth_comp_id: string, auth_asym_id: string,
    coords: LT.LLKAPoint,
    id: number,
    label_seq_id: number, auth_seq_id: number,
    pdbx_PDB_model_num: number, pdbx_PDB_ins_code: string,
    label_alt_id: number
): LT.LLKAAtom  => {
    return LLKAInstance.makeAtom(
        type_symbol,
        label_atom_id,
        label_entity_id,
        label_comp_id,
        label_asym_id,
        auth_atom_id,
        auth_comp_id,
        auth_asym_id,
        coords,
        id,
        label_seq_id,
        auth_seq_id,
        pdbx_PDB_model_num,
        pdbx_PDB_ins_code,
        label_alt_id
    );
}
const CLLKAStructure = (): LT.LLKAStructure => {
    return LLKAInstance.makeStdVectorStructure();
}

const CLLKAStructures = (): LT.LLKAStructures => {
    return LLKAInstance.makeStdVectorStructures();
}

const atomMatches = (
    atom: LT.LLKAAtom,
    label_atom_id: string,
    label_comp_id: string,
    label_asym_id: string,
    label_seq_id: number,
    label_alt_id = NO_ALTID,
    pdbx_PDB_ins_code = NO_INSCODE,
    pdbx_PDB_model_num = 1
): boolean  => {
    return LLKAInstance.atomMatches(atom, label_atom_id, label_comp_id, label_asym_id, label_seq_id, label_alt_id, pdbx_PDB_ins_code, pdbx_PDB_model_num);
}

/**
 * ==================
 *    Measurements
 * ==================
 */

const measureAnglef = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom) => {
    return LLKAInstance.measureAnglef(a, b, c);
}

const measureAngle = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom) => {
    return LLKAInstance.measureAngle(a, b, c);
}

const measureAngleld = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom) => {
    return LLKAInstance.measureAngleld(a, b, c);
}

const measureDihedralf = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom, d: LT.LLKAAtom) => {
    return LLKAInstance.measureDihedralf(a, b, c, d);
}

const measureDihedral = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom, d: LT.LLKAAtom) => {
    return LLKAInstance.measureDihedral(a, b, c, d);
}

const measureDihedralld = (a: LT.LLKAAtom, b: LT.LLKAAtom, c: LT.LLKAAtom, d: LT.LLKAAtom) => {
    return LLKAInstance.measureDihedralld(a, b, c, d);
}

const measureDistancef = (a: LT.LLKAAtom, b: LT.LLKAAtom) => {
    return LLKAInstance.measureDistancef(a, b);
}

const measureDistance = (a: LT.LLKAAtom, b: LT.LLKAAtom) => {
    return LLKAInstance.measureDistance(a, b);
}

const measureDistanceld = (a: LT.LLKAAtom, b: LT.LLKAAtom) => {
    return LLKAInstance.measureDistanceld(a, b);
}

/**
 * ==================
 *    Segmentation
 * ==================
 */

const CStructureSegmentation = (structure: LT.LLKAStructure) => {
    return new LLKAInstance.StructureSegmentation(structure);
}

/*
 * ==========================
 *    Classification types
 * ==========================
 */

const ClassificationViolation = {
    OK:                                                  0,
    E_SCORE_TOO_LOW:                                    (1 << 0),
    E_NOT_ENOUGH_NEAREST_NEIGHBORS:                     (1 << 1),
    E_AVERAGE_NEAREST_NEIGHBORS_TORSIONS_TOO_DIFFERENT: (1 << 2),
    E_NEAREST_NEIGHBOR_TORSIONS_TOO_DIFFERENT:          (1 << 3),
    E_CC_TOO_LOW:                                       (1 << 4),
    E_CC_TOO_HIGH:                                      (1 << 5),
    E_NN_TOO_LOW:                                       (1 << 6),
    E_NN_TOO_HIGH:                                      (1 << 7),
    E_MU_TOO_LOW:                                       (1 << 8),
    E_MU_TOO_HIGH:                                      (1 << 9),
    E_TOTAL_DISTANCE_TOO_HIGH:                          (1 << 10),
    E_FIRST_PSEUDOROTATION_TOO_DIFFERENT:               (1 << 11),
    E_SECOND_PSEUDOROTATION_TOO_DIFFERENT:              (1 << 12),
    E_BEST_CLUSTER_DOES_NOT_HAVE_ENOUGH_VOTES:          (1 << 13),
    E_DELTA_TORSION_ANGLE_REJECTED:                     (1 << 14),
    E_WRONG_METRICS:                                    (1 << 15),
    E_UNASSIGNED_BUT_CLOSE_ENOUGH:                      (1 << 16),
}

const ViolatingTorsions = {
    E_TORSION_DELTA_1:   (1 << 0),
    E_TORSION_EPSILON_1: (1 << 1),
    E_TORSION_ZETA_1:    (1 << 2),
    E_TORSION_ALPHA_2:   (1 << 3),
    E_TORSION_BETA_2:    (1 << 4),
    E_TORSION_GAMMA_2:   (1 << 5),
    E_TORSION_DELTA_2:   (1 << 6),
    E_TORSION_CHI_1:     (1 << 7),
    E_TORSION_CHI_2:     (1 << 8),
}

const classifyStep = (stru: LT.LLKAStructure) => {
    return LLKAInstance.classifyStep(stru, LLKAClassificationCtx);
}

/*
 * ======================================
 *               miniCIF
 * ======================================
 */

const CLLKACifDataValue = (text: string, state: LT.CifDataValueState) => {
    return { text: text, state: state };
}

const CLLKACifDataItem = (keyword: string, values: LT.LLKACifDataValues) => {
    return {
        keyword: keyword,
        values: (values === undefined ? LLKAInstance.makeStdVectorCifDataValue() : values),
    };
}


const CLLKACifDataCategory = (name: string, items: LT.LLKACifDataItems) => {
    return new LLKAInstance.CifDataCategory(
        name,
        items === undefined ? LLKAInstance.makeStdVectorCifDataItem() : items
    );
}

const CLLKACifDataBlock = (name: string, categories: LT.LLKACifDataCategories) => {
    return {
        name,
        categories: (categories === undefined ? LLKAInstance.makeStdVectorCifDataBlock() : categories),
    };
}

const CLLKACifData = () => {
    return { blocks: LLKAInstance.makeStdVectorCifDataBlock() };
}

const NO_ALTID: number = (new Uint8Array(1))[0];
const NO_INSCODE: string = '';

/*
 * ======================================
 *    Structure manipulation functions
 * ======================================
 */


const splitStructureToDinucleotideSteps = (structure: LT.LLKAStructure) => {
    return LLKAInstance.splitStructureToDinucleotideSteps(structure);
}

/*
 * =======================================
 *    Connectivity/similarity functions
 * =======================================
 */

const measureStepConnectivityNtCsMultipleFirst = (
    prevStepStru: LT.LLKAStructure,
    NtCsVector: LT.LLKAVector<LT.NtC>,
    currentStepStru: LT.LLKAStructure,
    ntc: LT.NtC
) => {
    return LLKAInstance.measureStepConnectivityNtCsMultipleFirst(prevStepStru, NtCsVector, currentStepStru, ntc);
}

const measureStepConnectivityNtCsMultipleSecond = (
    currentStepStru: LT.LLKAStructure,
    ntc: LT.NtC,
    nextStepStru: LT.LLKAStructure,
    NtCsVector: LT.LLKAVector<LT.NtC>
) => {
    return LLKAInstance.measureStepConnectivityNtCsMultipleSecond(currentStepStru, ntc, nextStepStru, NtCsVector);
}

const measureStepSimilarityNtCMultiple = (stru: LT.LLKAStructure, NtCsVector: LT.LLKAVector<LT.NtC>) => {
    return LLKAInstance.measureStepSimilarityNtCMultiple(stru, NtCsVector);
}

/*
 * ===================
 *    NtC functions
 * ===================
 */

const crossResidueMetricAtomsFromBases = (firstBase: string, secondBase: string, metric: LT.CrossResidueMetric) => {
    return LLKAInstance.crossResidueMetricAtomsFromBases(firstBase, secondBase, metric);
}

const crossResidueMetricAtomsFromStructure = (stru: LT.LLKAStructure, metric: LT.CrossResidueMetric) => {
    return LLKAInstance.crossResidueMetricAtomsFromStructure(stru, metric);
}

const dinucleotideTorsionAtomsBases = (firstBase: string, secondBase: string, torsion: LT.DinucleotideTorsion) => {
    return LLKAInstance.dinucleotideTorsionAtomsFromBases(firstBase, secondBase, torsion);
}

const dinucleotideTorsionAtomsFromStructure = (stru: LT.LLKAStructure, torsion: LT.DinucleotideTorsion) => {
    return LLKAInstance.dinucleotideTorsionAtomsFromStructure(stru, torsion);
}

const nameToNtC = (name: string): LT.NtC => {
    return LLKAInstance.nameToNtC(name);
}

const NtCToName = (ntc: LT.NtC): string => {
    return LLKAInstance.NtCToName(ntc);
}

/*
 * ========================
 *    MiniCif functions
 * ========================
 */

const MINICIF_NORMALIZE = 1;
const MINICIF_GET_CIFDATA = 2;

const cifDataToString = (cifData: LT.LLKACifData, pretty: boolean) => {
    return LLKAInstance.cifDataToString(cifData, pretty);
}

const cifToStructure = (cif: string, options: number) => {
    return LLKAInstance.cifToStructure(cif, options);
}

/*
 * ====================
 *    Classification
 * ====================
 */

const classificationClusterForNtC = (ntc: LT.NtC, ctx: LT.LLKAClassificationContext) => {
    return LLKAInstance.classificationClusterForNtC(ntc, ctx);
}

const classifySteps = (steps: LT.LLKAStructures, ctx: LT.LLKAClassificationContext) => {
    return LLKAInstance.classifySteps(steps, ctx);
}

const confalForNtC = (ntc: LT.NtC, ctx: LT.LLKAClassificationContext) => {
    return LLKAInstance.confalForNtC(ntc, ctx);
}

/*
 * =========================
 *     Service functions
 * =========================
 */

const VectorIterator = <T>(vec: LT.LLKAVector<T>) => {
    let index = 0;
    const length = vec.size();

    return {
        next() {
            if (index === length)
                return { value: null, done: true };
            const ret = { value: vec.get(index), done: false };
            index++;
            return ret;
        }
    }
}

const IterateVector = <T>(vec: LT.LLKAVector<T>) => {
    return {
        [Symbol.iterator]() { return VectorIterator(vec); }
    };
}

/*
 * =========================
 *    Data exchange types
 * =========================
 */

export type ClassificationResult = {
    assignedNtC: string,
    assignedCANA: string,
    closestNtC: string,
    closestCANA: string,
    confalScore: LT.LLKAConfalScore,
    euclideanDistanceNtCIdeal: number,
    metrics: LT.LLKAStepMetrics,
    differencesFromNtCAverages: LT.LLKAStepMetrics,
    nuAngles_1: LT.LLKANuAngles,
    nuAngles_2: LT.LLKANuAngles,
    ribosePseudorotation_1: number,
    ribosePseudorotation_2: number,
    tau_1: number,
    tau_2: number,
    sugarPucker_1: string,
    sugarPucker_2: string,
    nuAngleDifferences_1: LT.LLKANuAngles,
    nuAngleDifferences_2: LT.LLKANuAngles,
    rmsdToClosestNtC: number,
    closestGoldenStep: number,
    violations: number,
    violatingTorsionsAverage: number,
    violatingTorsionsNearest: number,
};




/*
 *
 */
export type AtomDescription = {
    element_type: string,
    label_atom_id: string,
    label_comp_id: string,
    id: number,
    label_seq_id: number,
    auth_seq_id: number,
    altloc: string,
};

export type CommandMessageBase = {
    uuid: string,
};
export type CommandMessageInitialize = {
    command: 'Initialize';
} & CommandMessageBase;
export type CommandMessageClassifyDinucleotide = {
    command: 'ClassifyDinucleotide',
    firstResidue: AtomDescription[],
    secondResidue: AtomDescription[],
} & CommandMessageBase;
export type CommandMessage =
    CommandMessageInitialize |
    CommandMessageClassifyDinucleotide;


export type ResponseBase = {
    uuid: string,
    success: boolean;
};
export type ResponseInitialize = {
    command: CommandMessageInitialize['command'],
    data: null,
} & ResponseBase;
export type ResponseClassifyDinucleotide = {
    command: CommandMessageClassifyDinucleotide['command'],
    data: ClassificationResult,
} & ResponseBase;
export type Response =
    ResponseInitialize |
    ResponseClassifyDinucleotide;

const classifyDinucleotides = (firstResidue, secondResidue) => {
    const stru = CLLKAStructure();

    for (const atom of [...firstResidue, ...secondResidue]) {
        const altloc = atom.altloc === '' ? NO_ALTID : atom.altloc.codePointAt(0);

        const a = CLLKAAtom(
            atom.element_type,
            atom.label_atom_id,
            '1', // Not necessary for NtC classification
            atom.label_comp_id,
            '',
            atom.label_atom_id,
            '',
            '',
            CLLKAPoint(atom.x, atom.y, atom.z),
            atom.id,
            atom.label_seq_id,
            atom.auth_seq_id,
            1, // Not necessary for NtC classification
            '',
            altloc
        );

        stru.push_back(a);
    }

    const rcResult = LLKAInstance.classifyStep(stru, LLKAClassificationCtx);
    if (!rcResult.isSuccess()) {
        const error = `Failed to classify step: ${LLKAInstance.errorToString(rcResult.failure())}`;
        console.log(error);

        rcResult.delete();

        return void 0;
    } else {
        const success: LT.LLKAClassifiedStep = rcResult.success();

        const output = {
            assignedNtC: NtCToName(success.assignedNtC),
            assignedCANA: LLKAInstance.CANAToName(success.assignedCANA),
            closestNtC: NtCToName(success.closestNtC),
            closestCANA: LLKAInstance.CANAToName(success.closestCANA),
            confalScore: success.confalScore,
            euclideanDistanceNtCIdeal: success.euclideanDistanceNtCIdeal,
            metrics: success.metrics,
            differencesFromNtCAverages: success.differencesFromNtCAverages,
            nuAngles_1: success.nuAngles_1,
            nuAngles_2: success.nuAngles_2,
            ribosePseudorotation_1: success.ribosePseudorotation_1,
            ribosePseudorotation_2: success.ribosePseudorotation_2,
            tau_1: success.tau_1,
            tau_2: success.tau_2,
            sugarPucker_1: LLKAInstance.sugarPuckerToName(success.sugarPucker_1, 0),
            sugarPucker_2: LLKAInstance.sugarPuckerToName(success.sugarPucker_2, 0),
            nuAngleDifferences_1: success.nuAngleDifferences_1,
            nuAngleDifferences_2: success.nuAngleDifferences_2,
            rmsdToClosestNtC: success.rmsdToClosestNtC,
            closestGoldenStep: success.closestGoldenStep,
            violations: success.violations,
            violatingTorsionsAverage: success.violatingTorsionsAverage,
            violatingTorsionsNearest: success.violatingTorsionsNearest,
        };

        rcResult.delete();

        return output;
    }
};


onmessage = function(e) {
    const message = e.data as CommandMessage;

    if (message.command === 'Initialize') {
        let memory64 = WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 5, 3, 1, 4, 1]))
        const isChromeLinux = (navigator.appVersion.indexOf("Linux") != -1) && (navigator.appVersion.indexOf("Chrome") != -1)

        if (memory64 && !isChromeLinux) {
            console.error('64-bit builds are not supported yet');
        }
        loadLLKA().then(instance => {
            LLKAInstance = instance;
            console.log('LLKA worker initialized');

            initializeLLKAClassificationContext().then((ctx) => {
                LLKAClassificationCtx = ctx;

                this.postMessage('LLKA worker fully initialized');
            });
        });
    } else if (message.command === 'ClassifyDinucleotide') {
        const result = classifyDinucleotides(message.firstResidue, message.secondResidue);

        if (result) {
            this.postMessage({
                uuid: message.uuid,
                command: 'ClassifyDinucleotide',
                success: true,
                data: result,
            });
        } else {
            this.postMessage({
                uuid: message.uuid,
                command: 'ClassifyDinucleotide',
                success: false,
            });
        }
    }
}

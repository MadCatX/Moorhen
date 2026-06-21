import { libcootApi } from "../../types/libcoot"
import * as LT from "../../types/llka";
import { gemmi } from "../../types/gemmi";

declare global {
    function createLLKAModule(arg0: any): Promise<any>;
    function createCootModule(arg0: any): Promise<any>;
}

let LLKAInstance;
const loadLLKA = async () =>  {
    importScripts("/MoorhenAssets/wasm/libLLKA.js");
    return await createLLKAModule({ locateFile: (p) => "/MoorhenAssets/wasm/" + p });
}

let libCootInstance: libcootApi.CootModule;
const loadLibCoot = async () => {
    importScripts("./moorhen.js");

    /* eslint-disable no-undef */
    return await createCootModule({
        onRuntimeInitialized: () => {
            console.log('libCoot RT initialized');
        },
        mainScriptUrlOrBlob: "moorhen.js",
        /* eslint-disable no-undef */
        print(t) {
            console.debug(["output", t]);
        },
        printErr(t) {
            console.debug(["output", t]);
        },
    });
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

const NtCStructure= (ntc: LT.NtC) => {
    return LLKAInstance.NtCStructure(ntc);
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
    element_name: string,
    element_sylbol: string,
    label_atom_id: string,
    label_comp_id: string,
    label_asym_id: string,
    id: number,
    label_seq_id: number,
    auth_seq_id: number,
    altloc: string,
};

export type CommandMessageBase = {
    uuid: string,
};
export type CommandMessageInitialize = {
    command: 'Initialize',
    cootData: Uint8Array,
} & CommandMessageBase;
export type CommandMessageClassifyDinucleotide = {
    command: 'SuperposeClosestNtC',
    firstResidue: AtomDescription[],
    secondResidue: AtomDescription[],
} & CommandMessageBase;
export type CommandSuperposeSpecificNtC = {
    command: 'SuperposeSpecificNtC',
    NtC: number,
    firstResidue: AtomDescription[],
    secondResidue: AtomDescription[],
} & CommandMessageBase;
export type CommandMessage =
    CommandMessageInitialize |
    CommandMessageClassifyDinucleotide |
    CommandSuperposeSpecificNtC;


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
export type ResponseSuperposeSpecificNtC = {
    command: CommandSuperposeSpecificNtC['command'],
    data: null,
} & ResponseBase;
export type Response =
    ResponseInitialize |
    ResponseClassifyDinucleotide |
    ResponseSuperposeSpecificNtC;


function atomsToLlkaStructure(atoms) {
    const stru = CLLKAStructure();

    for (const atom of atoms) {
        const altloc = atom.altloc === '' ? NO_ALTID : atom.altloc.codePointAt(0);

        const a = CLLKAAtom(
            atom.element_name,
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

    return stru;
}

function calculateStepMetrics(stru: LT.LLKAStructure, NtC: LT.NtC) {
    const metrics = LLKAInstance.calculateStepMetrics(stru).success();
    const diffs = LLKAInstance.calculateStepMetricsDifferenceAgainstReference(stru, NtC).success();

    return { metrics, diffs };
}

function classifyDinucleotide(stru: LT.LLKAStructure) {
    const rcResult = LLKAInstance.classifyStep(stru, LLKAClassificationCtx);
    if (!rcResult.isSuccess()) {
        const error = `Failed to classify step: ${LLKAInstance.errorToString(rcResult.failure())}`;
        rcResult.delete();

        throw new Error(error);
    } else {
        const success: LT.LLKAClassifiedStep = rcResult.success();
        const assignedNtC = success.assignedNtC;
        const closestNtC = success.closestNtC;

        rcResult.delete();

        return {
            assignedNtC: assignedNtC,
            closestNtC: closestNtC,
        };
        /*
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
        */
    }
};

const coortFlt = (f: number) => {
    return f.toFixed(3).padStart(8, ' ');
};

const llkaAtomToPdbLine = (atom: LT.LLKAAtom, serial: number) => {
    let altId = atom.label_alt_id === NO_ALTID ? '' : String.fromCodePoint(atom.label_alt_id);

    return `ATOM  ${String(serial).padStart(5, ' ')} ${atom.label_atom_id.padEnd(4, ' ')}${String(altId).padStart(1, ' ')}${atom.label_comp_id.padStart(3, ' ')} ${atom.label_asym_id}${String(atom.label_seq_id).padStart(4, ' ')}${String(atom.pdbx_PDB_ins_code).padStart(1, ' ')}   ${coortFlt(atom.coords.x)}${coortFlt(atom.coords.y)}${coortFlt(atom.coords.z)} 1.000 1.000${''.padEnd(10, ' ')}${atom.type_symbol.padStart(2, ' ')}`;
};

function llkaStruToPdb(stru: LT.LLKAStructure) {
    let pdbString = '';
    for (let idx = 0; idx < stru.size(); idx++) {
        const atom = stru.get(idx);
        pdbString += llkaAtomToPdbLine(atom, idx + 1) + "\n";
    }

    return pdbString;
}

function getAnchorAtomForBaseReplacement(stru: LT.LLKAStructure, seqId: number) {
    for (let idx = 0; idx < stru.size(); idx++) {
        const atom = stru.get(idx);
        if (atom.label_atom_id === 'N1' && atom.label_seq_id == seqId)
            return atom;
    }

    throw new Error('Anchor atom for base replacement was not found');
}

const replaceBase = (molTainer: libcootApi.MoleculesContainerJS, anchorAtom: LT.LLKAAtom, newBase: string) => {
    const anchor = `/1/${anchorAtom.label_asym_id}/${anchorAtom.label_seq_id}(${anchorAtom.label_comp_id})/${anchorAtom.auth_atom_id}${
        anchorAtom.label_alt_id === NO_ALTID ? "" : ":" + String.fromCodePoint(anchorAtom.label_alt_id)
    }`;

    console.log('ANCHOR', anchor);

    molTainer['mutate_base'](0, anchor, newBase);
};

function getStructureFromContainer(tainer: libcootApi.MoleculesContainerJS, format: 'pdb' | 'cif') {
    switch (format) {
        case 'cif': {
            tainer.writeCIFASCII(0, 'dummy.dat');
            break;
        }
        case 'pdb': {
            tainer.writePDBASCII(0, 'dummy.dat');
            break;
        }
    }

    const text = libCootInstance.FS.readFile('dummy.dat', { encoding: 'utf8' });
    libCootInstance.FS_unlink('dummy.dat');

    return text;
}

function NtCNumberToNtCEnum(NtC: number) {
    switch (NtC) {
        case 0: return LLKAInstance.NtC.LLKA_AA00;
        case 1: return LLKAInstance.NtC.LLKA_AA02;
        case 2: return LLKAInstance.NtC.LLKA_AA03;
        case 3: return LLKAInstance.NtC.LLKA_AA04;
        case 4: return LLKAInstance.NtC.LLKA_AA08;
        case 5: return LLKAInstance.NtC.LLKA_AA09;
        case 6: return LLKAInstance.NtC.LLKA_AA01;
        case 7: return LLKAInstance.NtC.LLKA_AA05;
        case 8: return LLKAInstance.NtC.LLKA_AA06;
        case 9: return LLKAInstance.NtC.LLKA_AA10;
        case 10: return LLKAInstance.NtC.LLKA_AA11;
        case 11: return LLKAInstance.NtC.LLKA_AA07;
        case 12: return LLKAInstance.NtC.LLKA_AA12;
        case 13: return LLKAInstance.NtC.LLKA_AA13;
        case 14: return LLKAInstance.NtC.LLKA_AB01;
        case 15: return LLKAInstance.NtC.LLKA_AB02;
        case 16: return LLKAInstance.NtC.LLKA_AB03;
        case 17: return LLKAInstance.NtC.LLKA_AB04;
        case 18: return LLKAInstance.NtC.LLKA_AB05;
        case 19: return LLKAInstance.NtC.LLKA_BA01;
        case 20: return LLKAInstance.NtC.LLKA_BA05;
        case 21: return LLKAInstance.NtC.LLKA_BA09;
        case 22: return LLKAInstance.NtC.LLKA_BA08;
        case 23: return LLKAInstance.NtC.LLKA_BA10;
        case 24: return LLKAInstance.NtC.LLKA_BA13;
        case 25: return LLKAInstance.NtC.LLKA_BA16;
        case 26: return LLKAInstance.NtC.LLKA_BA17;
        case 27: return LLKAInstance.NtC.LLKA_BB00;
        case 28: return LLKAInstance.NtC.LLKA_BB01;
        case 29: return LLKAInstance.NtC.LLKA_BB17;
        case 30: return LLKAInstance.NtC.LLKA_BB02;
        case 31: return LLKAInstance.NtC.LLKA_BB03;
        case 32: return LLKAInstance.NtC.LLKA_BB11;
        case 33: return LLKAInstance.NtC.LLKA_BB16;
        case 34: return LLKAInstance.NtC.LLKA_BB04;
        case 35: return LLKAInstance.NtC.LLKA_BB05;
        case 36: return LLKAInstance.NtC.LLKA_BB07;
        case 37: return LLKAInstance.NtC.LLKA_BB08;
        case 38: return LLKAInstance.NtC.LLKA_BB10;
        case 39: return LLKAInstance.NtC.LLKA_BB12;
        case 40: return LLKAInstance.NtC.LLKA_BB13;
        case 41: return LLKAInstance.NtC.LLKA_BB14;
        case 42: return LLKAInstance.NtC.LLKA_BB15;
        case 43: return LLKAInstance.NtC.LLKA_BB20;
        case 44: return LLKAInstance.NtC.LLKA_IC01;
        case 45: return LLKAInstance.NtC.LLKA_IC02;
        case 46: return LLKAInstance.NtC.LLKA_IC03;
        case 47: return LLKAInstance.NtC.LLKA_IC04;
        case 48: return LLKAInstance.NtC.LLKA_IC05;
        case 49: return LLKAInstance.NtC.LLKA_IC06;
        case 50: return LLKAInstance.NtC.LLKA_IC07;
        case 51: return LLKAInstance.NtC.LLKA_OP01;
        case 52: return LLKAInstance.NtC.LLKA_OP02;
        case 53: return LLKAInstance.NtC.LLKA_OP03;
        case 54: return LLKAInstance.NtC.LLKA_OP04;
        case 55: return LLKAInstance.NtC.LLKA_OP05;
        case 56: return LLKAInstance.NtC.LLKA_OP06;
        case 57: return LLKAInstance.NtC.LLKA_OP07;
        case 58: return LLKAInstance.NtC.LLKA_OP08;
        case 59: return LLKAInstance.NtC.LLKA_OP09;
        case 60: return LLKAInstance.NtC.LLKA_OP10;
        case 61: return LLKAInstance.NtC.LLKA_OP11;
        case 62: return LLKAInstance.NtC.LLKA_OP12;
        case 63: return LLKAInstance.NtC.LLKA_OP13;
        case 64: return LLKAInstance.NtC.LLKA_OP14;
        case 65: return LLKAInstance.NtC.LLKA_OP15;
        case 66: return LLKAInstance.NtC.LLKA_OP16;
        case 67: return LLKAInstance.NtC.LLKA_OP17;
        case 68: return LLKAInstance.NtC.LLKA_OP18;
        case 69: return LLKAInstance.NtC.LLKA_OP19;
        case 70: return LLKAInstance.NtC.LLKA_OP20;
        case 71: return LLKAInstance.NtC.LLKA_OP21;
        case 72: return LLKAInstance.NtC.LLKA_OP22;
        case 73: return LLKAInstance.NtC.LLKA_OP23;
        case 74: return LLKAInstance.NtC.LLKA_OP24;
        case 75: return LLKAInstance.NtC.LLKA_OP25;
        case 76: return LLKAInstance.NtC.LLKA_OP26;
        case 77: return LLKAInstance.NtC.LLKA_OP27;
        case 78: return LLKAInstance.NtC.LLKA_OP28;
        case 79: return LLKAInstance.NtC.LLKA_OP29;
        case 80: return LLKAInstance.NtC.LLKA_OP30;
        case 81: return LLKAInstance.NtC.LLKA_OP31;
        case 82: return LLKAInstance.NtC.LLKA_OPS1;
        case 83: return LLKAInstance.NtC.LLKA_OP1S;
        case 84: return LLKAInstance.NtC.LLKA_AAS1;
        case 85: return LLKAInstance.NtC.LLKA_AB1S;
        case 86: return LLKAInstance.NtC.LLKA_AB2S;
        case 87: return LLKAInstance.NtC.LLKA_BB1S;
        case 88: return LLKAInstance.NtC.LLKA_BB2S;
        case 89: return LLKAInstance.NtC.LLKA_BBS1;
        case 90: return LLKAInstance.NtC.LLKA_ZZ01;
        case 91: return LLKAInstance.NtC.LLKA_ZZ02;
        case 92: return LLKAInstance.NtC.LLKA_ZZ1S;
        case 93: return LLKAInstance.NtC.LLKA_ZZ2S;
        case 94: return LLKAInstance.NtC.LLKA_ZZS1;
        case 95: return LLKAInstance.NtC.LLKA_ZZS2;
        default: throw new Error(`Invalid NtC index ${NtC}`);
    }
}

function fixUpNtCBases(NtC: LT.NtC, targetFirstBase: string, targetSecondBase: string) {
    // Get the reference NtC structure and write it out as PDB
    const ntcStru: LT.LLKAStructure = LLKAInstance.NtCStructure(NtC);
    const ntcStruPdbString = llkaStruToPdb(ntcStru);

    // Add the molecules to the Coot container
    const molTainer = new libCootInstance.molecules_container_js(false);

    console.log(molTainer);

    molTainer.set_use_gemmi(true);
    molTainer.set_show_timings(false);
    molTainer.set_refinement_is_verbose(false);
    molTainer.set_map_sampling_rate(1.7);
    molTainer.set_map_is_contoured_with_thread_pool(false);
    molTainer.set_max_number_of_threads(1);

    molTainer.read_coords_string(ntcStruPdbString, 'AUX');

    // Use Coot to replace the bases
    replaceBase(molTainer, getAnchorAtomForBaseReplacement(ntcStru, 1), targetFirstBase);
    replaceBase(molTainer, getAnchorAtomForBaseReplacement(ntcStru, 2), targetSecondBase);

    const fixedNtCStructureCifString = getStructureFromContainer(molTainer, 'cif');

    console.log('PDB structure after replacing');
    console.log(fixedNtCStructureCifString);

    const fixedNtcStruRes = LLKAInstance.cifToStructure(fixedNtCStructureCifString, 4 | 8);
    if (!fixedNtcStruRes.isSuccess()) {
        const error = fixedNtcStruRes.failure().error;
        throw new Error(`Could not create structure from the CIF string with the "fixed" NtC: ${error}`);
    }
    const fixedNtcStru = fixedNtcStruRes.success();
    fixedNtcStruRes.delete();
    ntcStru.delete();

    //
    // We have imported the structure as a PDB file but libcoot internals,
    // specifically mmdb2, does not populate label_ fields when it gets
    // PDB as the input. We need to fix this up ourselves.
    //
    const stru: LT.LLKAStructure = fixedNtcStru.structure;
    for (let idx = 0; idx < stru.size(); idx++) {
        const atom = stru.get(idx);
        atom.label_seq_id = atom.auth_seq_id;
        atom.label_comp_id = atom.auth_comp_id;
        stru.set(idx, atom);
    }

    return stru;
}

function superposeNtC(NtC: LT.NtC, stru: LT.LLKAStructure, targetFirstBase: string, targetSecondBase: string) {
    const ntcStru = fixUpNtCBases(NtC, targetFirstBase, targetSecondBase);

    //
    // Get the backbones of the reference NtC structure and the dinucleotide
    // so that we can superpose the reference NtC onto the dinucleotide
    //
    const ntcBkbnRes = LLKAInstance.extractBackbone(ntcStru);
    if (!ntcBkbnRes.isSuccess()) {
        throw new Error(`Could not extract backbone from reference NtC structure. This should never happen: ${ntcBkbnRes.failure()}`)
    }
    const bkbnRes = LLKAInstance.extractBackbone(stru)
    if (!bkbnRes.isSuccess()) {
        ntcBkbnRes.delete();

        throw new Error(`Could not extract backbone from structure: ${bkbnRes.failure()}`);
    }
    const ntcBkbn = ntcBkbnRes.success();
    const bkbn = bkbnRes.success();

    //
    // Superpose the backbone of the reference NtC onto the backbone
    // of the target dinucleotide so that we can calculate RMSD
    //
    const matrix = LLKAInstance.superpositionMatrixStructures(ntcBkbn, bkbn).success();
    LLKAInstance.applyTransformationStructure(ntcBkbn, matrix);

    const rmsdRes = LLKAInstance.rmsd(ntcBkbn, bkbn);
    if (!rmsdRes.isSuccess()) {
        bkbn.delete();
        ntcBkbn.delete();

        throw new Error(`Could not calculate RMSD: ${rmsdRes.failure()}`);
    }

    //
    // Superpose the entire NtC onto the target dinucleotide
    //
    LLKAInstance.applyTransformationStructure(ntcStru, matrix);

    matrix.delete();
    ntcBkbn.delete();
    bkbn.delete();

    const ret = {
        superposedNtCStructure: llkaStruToPdb(ntcStru),
        rmsd: rmsdRes.success(),
    };

    ntcStru.delete();

    return ret;
}

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
        loadLibCoot().then(instance => {
            libCootInstance = instance;
            console.log('libCoot loaded');

            const fileData = message.cootData;
            let doUnzip = false
            let unzipName = ""

            let tarFileName = "data.tar"
            if(fileData[0]==0x1F && fileData[1]==0x8B){
                doUnzip = true
                tarFileName = "data.tar.gz"
                unzipName = "data_tmp/data.tar"
            }

            //FIXME - Need to consider the case of doUnzip is true.
            libCootInstance.FS.mkdir("data_tmp")
            libCootInstance.FS_createDataFile("data_tmp", tarFileName, fileData, true, true);
            const retVal = libCootInstance.unpackCootDataFile("data_tmp/"+tarFileName,doUnzip, unzipName,"")
            libCootInstance.FS_unlink("data_tmp/"+tarFileName)
            libCootInstance.FS.mkdir("COOT_BACKUP")
        });
    } else if (message.command === 'SuperposeClosestNtC') {
        const stru = atomsToLlkaStructure([...message.firstResidue, ...message.secondResidue]);
        const targetFirstBase = stru.get(0).label_comp_id;
        const targetSecondBase = stru.get(stru.size() - 1).label_comp_id;

        try {
            const { assignedNtC, closestNtC } = classifyDinucleotide(stru);
            const { superposedNtCStructure, rmsd } = superposeNtC(closestNtC, stru,  targetFirstBase, targetSecondBase);
            const { metrics, diffs } = calculateStepMetrics(stru, assignedNtC);

            stru.delete();

            const result = {
                assignedNtC: NtCToName(assignedNtC),
                closestNtC: NtCToName(closestNtC),
                superposedNtCStructure,
                rmsd,
                metrics,
                diffs,
            };

            this.postMessage({
                uuid: message.uuid,
                command: 'SuperposeClosestNtC',
                success: true,
                data: result,
            });
        } catch (e) {
            stru.delete();

            console.error(e);

            this.postMessage({
                uuid: message.uuid,
                command: 'SuperposeClosestNtC',
                success: false,

            });
        }
    } else if (message.command === 'SuperposeSpecificNtC') {
        const stru = atomsToLlkaStructure([...message.firstResidue, ...message.secondResidue]);
        const targetFirstBase = stru.get(0).label_comp_id;
        const targetSecondBase = stru.get(stru.size() - 1).label_comp_id;

        try {
            const NtC = NtCNumberToNtCEnum(message.NtC);
            const { superposedNtCStructure, rmsd } = superposeNtC(NtC, stru, targetFirstBase, targetSecondBase);
            const { metrics, diffs } = calculateStepMetrics(stru, NtC);

            stru.delete();

            const result = {
                assignedNtC: NtCToName(NtC),
                closestNtC: NtCToName(NtC),
                superposedNtCStructure,
                rmsd,
                metrics,
                diffs,
            }

            this.postMessage({
                uuid: message.uuid,
                command: 'SuperposeSpecificNtC',
                success: true,
                data: result,
            });
        } catch (e) {
            stru.delete();

            console.error(e);

            this.postMessage({
                uuid: message.uuid,
                command: 'SuperposeSpecificNtC',
                success: false,

            });
        }
    }
}

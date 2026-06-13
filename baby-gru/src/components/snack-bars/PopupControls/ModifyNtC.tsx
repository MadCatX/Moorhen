import { ClickAwayListener } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setShownControl } from "@/store";
import { MoorhenStack } from "@/components/interface-base";
import { gemmi } from "../../../types/gemmi";
import { useCommandCentre } from "@/InstanceManager";

import * as LT from "../../../types/llka";
import { useCallback, useEffect, useMemo, useState } from "react";

type Classification = {
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

const NtCs = [
    'AA00',
    'AA02',
    'AA03',
    'AA04',
    'AA08',
    'AA09',
    'AA01',
    'AA05',
    'AA06',
    'AA10',
    'AA11',
    'AA07',
    'AA12',
    'AA13',
    'AB01',
    'AB02',
    'AB03',
    'AB04',
    'AB05',
    'BA01',
    'BA05',
    'BA09',
    'BA08',
    'BA10',
    'BA13',
    'BA16',
    'BA17',
    'BB00',
    'BB01',
    'BB17',
    'BB02',
    'BB03',
    'BB11',
    'BB16',
    'BB04',
    'BB05',
    'BB07',
    'BB08',
    'BB10',
    'BB12',
    'BB13',
    'BB14',
    'BB15',
    'BB20',
    'IC01',
    'IC02',
    'IC03',
    'IC04',
    'IC05',
    'IC06',
    'IC07',
    'OP01',
    'OP02',
    'OP03',
    'OP04',
    'OP05',
    'OP06',
    'OP07',
    'OP08',
    'OP09',
    'OP10',
    'OP11',
    'OP12',
    'OP13',
    'OP14',
    'OP15',
    'OP16',
    'OP17',
    'OP18',
    'OP19',
    'OP20',
    'OP21',
    'OP22',
    'OP23',
    'OP24',
    'OP25',
    'OP26',
    'OP27',
    'OP28',
    'OP29',
    'OP30',
    'OP31',
    'OPS1',
    'OP1S',
    'AAS1',
    'AB1S',
    'AB2S',
    'BB1S',
    'BB2S',
    'BBS1',
    'ZZ01',
    'ZZ02',
    'ZZ1S',
    'ZZ2S',
    'ZZS1',
    'ZZS2'
] as const;

function altlocToStr(codepoint: number) {
    if (codepoint === 0) return '';
    return String.fromCodePoint(codepoint);
}

function makeLlkaResidue(gemmiResidue: gemmi.Residue, filterAltloc: string) {
    const atoms = [];

    for (let idx = 0; idx < gemmiResidue.atoms.size(); idx++) {
        const gemmiAtom = gemmiResidue.atoms.get(idx);
        const altloc = altlocToStr(gemmiAtom.altloc_or(0));
        if (altloc === '' || altloc === filterAltloc) {
            atoms.push({
                element_name: gemmiAtom.name,
                element_symbol: gemmiAtom.element.name(),
                label_atom_id: gemmiAtom.name,
                label_comp_id: gemmiResidue.name,
                label_asym_id: 'X', // The actual chain name is irrelevvant
                id: gemmiAtom.serial,
                x: gemmiAtom.pos.x,
                y: gemmiAtom.pos.y,
                z: gemmiAtom.pos.z,
                label_seq_id: gemmiResidue.seqid.num.value,
                auth_seq_id: gemmiResidue.seqid.num.value, // Placeholder
                altloc: altlocToStr(gemmiAtom.altloc_or(0)),
                inscode: gemmiResidue.seqid.str(),
            });
        }
    }

    return atoms;
}

function gatherAltLocs(residue: gemmi.Residue) {
    const altlocs = new Set();

    for (let idx = 0; idx < residue.atoms.size(); idx++) {
        const atom = residue.atoms.get(idx);

        if (atom.has_altloc()) {
            let alt = altlocToStr(atom.altloc);
            altlocs.add(alt);
        }
    }

    return Array.from(altlocs);
}

export const ModifyNtC = () => {
    const dispatch = useDispatch();
    const shownControl = useSelector((state: RootState) => state.globalUI.shownControl);

    const cc = useCommandCentre();
    const [classification, setClassification] = useState<Classification | null>(null)
    const [selectedAltlocs, setSelectedAltlocs] = useState("-^-");
    const [selectedNtC, setSelectedNtC] = useState(0);

    const altlocCombinations = useMemo(() => {
        const firstResidue =  shownControl?.name === "modifyNtC" ? shownControl.payload?.firstResidue : void 0;
        const secondResidue = shownControl?.name === "modifyNtC" ? shownControl.payload?.secondResidue : void 0;

        if (!firstResidue || !secondResidue) return ["-^-"];

        let altlocsFirst = gatherAltLocs(firstResidue);
        let altlocsSecond = gatherAltLocs(secondResidue);
        if (altlocsFirst.length === 0) altlocsFirst.push(null);
        if (altlocsSecond.length === 0) altlocsSecond.push(null);

        const combinations = [];
        for (const altFirst of altlocsFirst) {
            for (const altSecond of altlocsSecond) {
                const tag = `${altFirst ?? '-'}^${altSecond ?? '-'}`;
                const text = `${altFirst ?? '-'} | ${altSecond ?? '-'}`;

                combinations.push([tag, text]);
            }
        }

        return combinations;
    }, [shownControl]);

    useEffect(() => {
        setSelectedAltlocs(altlocCombinations[0][0]);
    }, [altlocCombinations]);

    const getResidues = useCallback(() => {
        const firstResidue =  shownControl?.name === "modifyNtC" ? shownControl.payload?.firstResidue : void 0;
        const secondResidue = shownControl?.name === "modifyNtC" ? shownControl.payload?.secondResidue : void 0;
        if (!firstResidue || !secondResidue) return void 0;

        const altlocCombination = altlocCombinations.find(([tag, _]) => tag === selectedAltlocs)[0];
        const [altlocA, altlocB] = altlocCombination.split('^', 2);

        const first = makeLlkaResidue(firstResidue, altlocA);
        const second = makeLlkaResidue(secondResidue, altlocB);

        return [first, second];
    }, [shownControl, selectedAltlocs]);

    const runClassification = () => {
        const residues = getResidues();
        if (!residues) return;

        cc.current.llkaCommand(
            {
                uuid: '',
                command: 'ClassifyDinucleotide',
                firstResidue: residues[0],
                secondResidue: residues[1],
            }
        ).then((data) => {
            setClassification(data);
        });
    };

    useEffect(() => {
        runClassification();
    }, [selectedAltlocs]);

    return (
        <ClickAwayListener onClickAway={() => dispatch(setShownControl(null))}>
            <MoorhenStack direction="vertical">
                <div>Modify NtC</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                    <div>Assigned NtC</div>
                    <div>{classification?.assignedNtC ?? ''}</div>

                    <div>Closest NtC</div>
                    <div>{classification?.closestNtC ?? '' }</div>

                    <div>RMSD of displayed NtC</div>
                    <div>{classification?.rmsdToClosestNtC}</div>

                    <div>Alt. conf</div>
                    <div>
                        <select
                            value={selectedAltlocs}
                            onChange={(v) => setSelectedAltlocs(v.currentTarget.value)}
                        >
                            {altlocCombinations.map(([tag, text], idx) => <option value={tag} key={idx}>{text}</option>)}
                        </select>
                    </div>

                    <div>Displayed NtC</div>
                    <div>
                        <select
                            value={selectedNtC}
                            onChange={(v) => {
                                const NtCIndex = parseInt(v.currentTarget.value);
                                setSelectedNtC(NtCIndex);

                                const residues = getResidues();
                                if (!residues) return;

                                cc.current.llkaCommand({
                                    uuid: '',
                                    command: 'SuperposeSpecificNtC',
                                    NtC: NtCIndex,
                                    firstResidue: residues[0],
                                    secondResidue: residues[1],
                                });
                            }}
                        >
                            {NtCs.map((ntc, idx) => <option key={idx} value={idx}>{ntc}</option>)}
                        </select>

                        <button>Reset</button>
                    </div>
                </div>

                <div>Torsions &amp; distances</div>


                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto'}}>
                    <div></div>
                    <div>Actual (deg)</div>
                    <div>{'\u03B4'} to NtC (deg)</div>

                    <div>{'\u018D'}1</div>
                    <div>{classification?.metrics.delta_1 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.delta_1 ?? ''} </div>

                    <div>{'\u025B'}1</div>
                    <div>{classification?.metrics.epsilon_1 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.epsilon_1 ?? ''}</div>

                    <div>{'\u03B6'}1</div>
                    <div>{classification?.metrics.zeta_1 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.zeta_1 ?? ''}</div>

                    <div>{'\u03B1'}2</div>
                    <div>{classification?.metrics.alpha_2 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.alpha_2 ?? ''}</div>

                    <div>{'\u03B2'}2</div>
                    <div>{classification?.metrics.beta_2 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.beta_2 ?? ''}</div>

                    <div>{'\u03B3'}2</div>
                    <div>{classification?.metrics.gamma_2 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.gamma_2 ?? ''}</div>

                    <div>{'\u03B4'}2</div>
                    <div>{classification?.metrics.delta_2 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.delta_2 ?? ''}</div>

                    <div>{'\u03C7'}1</div>
                    <div>{classification?.metrics.chi_1 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.chi_1 ?? ''}</div>

                    <div>{'\u03C7'}2</div>
                    <div>{classification?.metrics.chi_2 ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.chi_2 ?? ''}</div>

                    <div>C&apos;C&apos;</div>
                    <div>{classification?.metrics.CC ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.CC ?? ''}</div>

                    <div>N&apos;N&apos;</div>
                    <div>{classification?.metrics.NN ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.NN ?? ''}</div>

                    <div>{'\u00B5'}</div>
                    <div>{classification?.metrics.mu ?? ''}</div>
                    <div>{classification?.differencesFromNtCAverages.mu ?? ''}</div>
                </div>
            </MoorhenStack>
        </ClickAwayListener>
    );
}

import { useDispatch } from "react-redux";
import { setShownControl } from "@/store";
import { moorhen } from "../../types/moorhen";
import { MoorhenContextButtonBase, ContextButtonProps } from "./MoorhenContextButtonBase";


function findResidue(molecule: moorhen.Molecule, atom: moorhen.ResidueSpec, next: number) {
    const model = molecule.gemmiStructure.models.get(0);
    for (let chainIdx = 0; chainIdx < model.chains.size(); chainIdx++) {
        let chain = model.chains.get(chainIdx);
        if (chain.name != atom.chain_id) {
            console.log('bad chain', chain.name, atom.chain_id);
            continue;
        }

        for (let residueIdx = 0; residueIdx < chain.residues.size(); residueIdx++) {
            let residue = chain.residues.get(residueIdx);
            if (residue.seqid.num.value != atom.res_no + next) {
                continue;
            }

            return residue;
        }
    }

    return void 0;
}

export const MoorhenNtcButton = (props: ContextButtonProps) => {
    const dispatch = useDispatch();

    let firstResidue = findResidue(props.selectedMolecule, props.chosenAtom, 0)
    let secondResidue = findResidue(props.selectedMolecule, props.chosenAtom, 1);

    const nonCootCommand = async () => {
        if (!firstResidue) {
            console.warn('No first residue');
            return;
        }
        if (!secondResidue) {
            console.warn('No second residue');
            return;
        }

        dispatch(
            setShownControl({
                name: "modifyNtC",
                payload: {
                    molNo: props.selectedMolecule.molNo,
                    firstResidue,
                    secondResidue,
               },
            })
        );
    };

    return (
        <MoorhenContextButtonBase
            icon={<div>NtC</div>}
            nonCootCommand={nonCootCommand}
            needsMapData={false}
            toolTipLabel="Modify NtC"
            {...props}
        />
    );
}

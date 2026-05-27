import { useDispatch } from "react-redux";
import { setShownControl } from "@/store";
import { moorhen } from "../../types/moorhen";
import { MoorhenContextButtonBase, ContextButtonProps } from "./MoorhenContextButtonBase";

export const MoorhenNtcButton = (props: ContextButtonProps) => {
    const dispatch = useDispatch();

    const nonCootCommand = async (molecule: moorhen.Molecule, chosenAtom: moorhen.ResidueSpec) => {
        dispatch(
            setShownControl({
                name: "modifyNtC",
                payload: {
                    molNo: molecule.molNo,
                    chosenAtom,
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

import CaretDownIcon from '@icons/caret-down-fill.svg?react';
import CaretUpIcon from '@icons/caret-up-fill.svg?react';
import { useContext } from 'react';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function ResultSection() {
	const { inputFiles, outputFiles, seeMore, handleSeeMore } = useContext(CreateJobContext)!;

	return (
		<div className={styles['result-section']}>
			<h3>{`${inputFiles.length} ${inputFiles.length > 1 ? 'Results' : 'Result'}`}</h3>
			<div className={styles['table-wrapper']}>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>Input</th>
							<th>Output</th>
						</tr>
					</thead>
					<tbody>
						{inputFiles.slice(0, seeMore ? inputFiles.length : 5).map((file, index) => {
							const outputFile = outputFiles[index];

							const inputText =
								file.path.length > 50
									? `${file.path.slice(0, 10)}...${file.path.slice(-37)}`
									: file.path;

							const outputText =
								outputFile.path.length > 50
									? `${outputFile.path.slice(0, 10)}...${outputFile.path.slice(
											-37
									  )}`
									: outputFile.path;

							return (
								<tr key={index}>
									<td className={styles['index-cell']}>{index + 1}</td>
									<td className={styles['input-cell']} title={file.path}>
										{inputText}
									</td>
									<td className={styles['output-cell']} title={outputFile.path}>
										{outputText}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{inputFiles.length > 5 && (
				<button className={styles['see-more']} onClick={handleSeeMore}>
					{/* <i className={`bi ${seeMore ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`} /> */}
					{seeMore ? <CaretUpIcon /> : <CaretDownIcon />}
					<span>{seeMore ? ' See Less' : ` See ${inputFiles.length - 5} More`}</span>
				</button>
			)}
		</div>
	);
}

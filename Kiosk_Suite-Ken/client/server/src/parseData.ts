function Tag_parser(tag: string) {
	const start = tag.indexOf("\{");
	const end = tag.indexOf("\}");
	const info = tag.substring(start, end + 1);
	return info;
}
export default Tag_parser; 

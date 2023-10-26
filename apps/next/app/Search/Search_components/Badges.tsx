const TechBadge = () => {
  return (
    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
      Tech
    </span>
  );
};

const JSBadge = () => {
  return (
    <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
      JavaScript
    </span>
  );
};

const PhilosophyBadge = () => {
  return (
    <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
      Philosophy
    </span>
  );
};

const WritingBadge = () => {
  return (
    <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
      Writing
    </span>
  );
};

const ShitpostBadge = () => {
  return (
    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
      Shitpost
    </span>
  );
};

const CommentaryBadge = () => {
  return (
    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
      Commentary
    </span>
  );
};



export type tags =
  | "tech"
  | "writing"
  | "commentary"
  | "philosophy"
  | "shitpost"
  | "js";

export const DescriptionTags = (tags: tags[]) => {
  const components = [] as JSX.Element[];
  tags.forEach((el, i) => {
    if (i < 2) {
      //todo: switch case
      if (el == "tech") {
        components.push(TechBadge());
      }
      if (el == "writing") {
        components.push(WritingBadge());
      }
      if (el == "commentary") {
        components.push(CommentaryBadge());
      }
      if (el == "philosophy") {
        components.push(PhilosophyBadge());
      }
      if (el == "shitpost") {
        components.push(ShitpostBadge());
      }
      if (el == "js") {
        components.push(JSBadge());
      }
    }
  });
  //console.log(tags,components)
  return components;
};

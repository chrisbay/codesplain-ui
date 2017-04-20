import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { CardText } from 'material-ui/Card';
import { withRouter } from 'react-router';

import {
  openAnnotationPanel,
  closeAnnotationPanel,
} from '../actions/annotation';
import {
  saveAnnotation,
  saveExisting,
} from '../actions/app';
import AnnotationPanel from '../components/AnnotationPanel';
import {
  getAnnotatedLines,
  getNextAnnotation,
  getPreviousAnnotation,
  hasNextAnnotation,
  hasPreviousAnnotation,
} from '../util/annotations';
import CustomPropTypes from '../util/custom-prop-types';

export class Annotations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayStatus: 'none',
      hasPreceedingAnnotation: false,
      hasProceedingAnnotation: false,
    };
    this.handleCloseAnnotation = this.handleCloseAnnotation.bind(this);
    this.handleSaveAnnotation = this.handleSaveAnnotation.bind(this);
    this.getPreviousAnnotation = this.getPreviousAnnotation.bind(this);
    this.getNextAnnotation = this.getNextAnnotation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      annotations,
      lineAnnotated: {
        lineNumber,
      },
    } = nextProps;
    const nextAnnotatedLines = getAnnotatedLines(annotations);
    this.setState({
      hasProceedingAnnotation: hasNextAnnotation(nextAnnotatedLines, lineNumber),
      hasPreceedingAnnotation: hasPreviousAnnotation(nextAnnotatedLines, lineNumber),
    });
  }

  getPreviousAnnotation() {
    const {
      lineAnnotated: {
        lineNumber: currentLineNumber,
      },
      annotations,
      dispatch,
    } = this.props;

    // Get the annotated lines
    const previous = getPreviousAnnotation(annotations, currentLineNumber);
    if (!previous) {
      return;
    }
    const toDisplay = {
      lineNumber: previous.lineNumber,
      lineText: previous.lineText,
    };
    dispatch(openAnnotationPanel(toDisplay));
  }

  getNextAnnotation() {
    const {
      lineAnnotated: {
        lineNumber: currentLineNumber,
      },
      annotations,
      dispatch,
    } = this.props;

    // Get the annotated lines
    const next = getNextAnnotation(annotations, currentLineNumber);
    if (!next) {
      return;
    }
    const toDisplay = {
      lineNumber: next.lineNumber,
      lineText: next.lineText,
    };
    dispatch(openAnnotationPanel(toDisplay));
  }

  handleCloseAnnotation() {
    const { dispatch } = this.props;
    dispatch(closeAnnotationPanel());
  }

  handleSaveAnnotation(annotation) {
    const {
      dispatch,
      lineAnnotated,
      snippetKey,
    } = this.props;

    const annotationData = {
      annotation,
      ...lineAnnotated,
    };

    dispatch(saveAnnotation(annotationData));
    // Save the snippet only if this snippet has already been saved.
    if (snippetKey) {
      dispatch(saveExisting());
    }
  }

  render() {
    const {
      annotation,
      isDisplayingAnnotation,
      lineAnnotated,
      readOnly,
    } = this.props;

    const {
      hasProceedingAnnotation,
      hasPreceedingAnnotation,
    } = this.state;

    if (!isDisplayingAnnotation) {
      const prompt = readOnly ?
        'Click on a line number to add an annotation or display one' :
        'Lock this snippet to add annotations';
      return (
        <CardText>{prompt}</CardText>
      );
    }
    return (
      <AnnotationPanel
        annotation={annotation}
        lineAnnotated={lineAnnotated}
        saveAnnotation={this.handleSaveAnnotation}
        closeAnnotation={this.handleCloseAnnotation}
        getNextAnnotation={this.getNextAnnotation}
        getPreviousAnnotation={this.getPreviousAnnotation}
        hasPrevAnnotation={hasPreceedingAnnotation}
        hasNextAnnotation={hasProceedingAnnotation}
      />
    );
  }
}

Annotations.propTypes = {
  annotation: PropTypes.string.isRequired,
  annotations: CustomPropTypes.annotations.isRequired,
  isDisplayingAnnotation: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool.isRequired,
  lineAnnotated: CustomPropTypes.lineAnnotated.isRequired,
  snippetKey: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  const {
    annotation: {
      isDisplayingAnnotation,
      lineAnnotated,
    },
    app: {
      annotations,
      readOnly,
      snippetKey,
    },
  } = state;
  const { lineNumber } = lineAnnotated;
  // Check that
  const annotation = (isDisplayingAnnotation && annotations[lineNumber] && annotations[lineNumber].annotation) || '';
  return {
    annotation,
    annotations,
    isDisplayingAnnotation,
    lineAnnotated,
    readOnly,
    snippetKey,
  };
};

export default withRouter(connect(mapStateToProps)(Annotations));
